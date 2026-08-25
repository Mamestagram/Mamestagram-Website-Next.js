import bcrypt from "bcrypt";
import { createHash } from "crypto";
import type { RowDataPacket } from "mysql2/promise";
import { executeQuery, withTransaction } from "./connection";
import {
	createDanStatsQuery,
	createStatsQuery,
	createUserQuery,
	deleteOrphanedDanStatsQuery,
	deleteOrphanedStatsQuery,
	latestUserIdForUpdateQuery,
	registrationConflictQuery,
	userByIdQuery,
	userByLoginQuery
} from "./query/auth";

export type AuthUser = {
	id: number,
	clanId?: number,
	priv: number,
	username: string,
	country: string,
	passwordHash: string
};

type AuthUserRow = RowDataPacket & {
	id: number,
	clan_id: number | null,
	priv: number,
	name: string,
	country: string,
	pw_bcrypt: string
};

type LatestUserIdRow = RowDataPacket & {
	id: number
};

const initialDanStats = [
	{ mode: 0, type: 0, cs: 0 },
	{ mode: 0, type: 1, cs: 0 },
	{ mode: 1, type: 0, cs: 0 },
	{ mode: 1, type: 1, cs: 0 },
	{ mode: 1, type: 2, cs: 0 },
	{ mode: 2, type: 0, cs: 0 },
	{ mode: 3, type: 0, cs: 4 },
	{ mode: 3, type: 1, cs: 4 },
	{ mode: 3, type: 2, cs: 4 },
	{ mode: 3, type: 3, cs: 4 },
	{ mode: 3, type: 4, cs: 4 },
	{ mode: 3, type: 5, cs: 6 },
	{ mode: 3, type: 6, cs: 6 },
	{ mode: 3, type: 7, cs: 6 },
	{ mode: 3, type: 8, cs: 7 },
	{ mode: 3, type: 9, cs: 7 },
	{ mode: 3, type: 10, cs: 7 },
	{ mode: 3, type: 11, cs: 7 },
	{ mode: 3, type: 12, cs: 10 },
	{ mode: 3, type: 13, cs: 4 }
] as const;

export const makeSafeName = (username: string) => username.trim().toLowerCase().replaceAll(" ", "_");

const toAuthUser = (row: AuthUserRow): AuthUser => ({
	id: row.id,
	clanId: row.clan_id ?? undefined,
	priv: row.priv,
	username: row.name,
	country: row.country,
	passwordHash: row.pw_bcrypt
});

export const getUserByLogin = async (login: string) => {
	const normalizedLogin = login.trim().toLowerCase();
	const users = await executeQuery<AuthUserRow>(
		userByLoginQuery,
		[makeSafeName(login), normalizedLogin]
	);
	return users.at(0) ? toAuthUser(users.at(0)!) : null;
}

export const getUserById = async (id: number) => {
	const users = await executeQuery<AuthUserRow>(
		userByIdQuery,
		[id]
	);
	return users.at(0) ? toAuthUser(users.at(0)!) : null;
}

export const findRegistrationConflict = async (username: string, email: string) => {
	const users = await executeQuery<RowDataPacket & { safe_name: string, email: string }>(
		registrationConflictQuery,
		[makeSafeName(username), email.toLowerCase()]
	);
	return users.at(0) ?? null;
}

export const hashPassword = async (password: string) => {
	const osuPassword = createHash("md5").update(password, "utf8").digest("hex");
	return await bcrypt.hash(osuPassword, 12);
}

export const verifyPassword = async (password: string, passwordHash: string) => {
	const osuPassword = createHash("md5").update(password, "utf8").digest("hex");
	return await bcrypt.compare(osuPassword, passwordHash);
}

export const createUser = async ({ username, email, password, country }: {
	username: string,
	email: string,
	password: string,
	country: string
}) => {
	const passwordHash = await hashPassword(password);
	const safeName = makeSafeName(username);
	const now = Math.floor(Date.now() / 1000);
	const modes = [0, 1, 2, 3, 4, 5, 6, 8] as const;
	
	return await withTransaction(async (connection) => {
		const [latestUsers] = await connection.query<LatestUserIdRow[]>(latestUserIdForUpdateQuery);
		const id = (latestUsers.at(0)?.id ?? 0) + 1;
		if (!Number.isSafeInteger(id) || id < 1)
			throw new Error("A valid user ID could not be assigned.");
		
		await connection.query(
			createUserQuery,
			[id, username, safeName, email.toLowerCase(), passwordHash, country, now, now]
		);
		const statsArgs = modes.flatMap((mode) => [id, mode]);
		const danStatsArgs = initialDanStats.flatMap(({ mode, type, cs }) => [id, mode, type, cs]);
		
		await connection.query(deleteOrphanedStatsQuery, [id]);
		await connection.query(deleteOrphanedDanStatsQuery, [id]);
		await connection.query(
			createStatsQuery(modes.length),
			statsArgs
		);
		await connection.query(
			createDanStatsQuery(initialDanStats.length),
			danStatsArgs
		);
		// await createEmptyUserLog(id);
		
		return {
			id,
			priv: 1,
			username,
			country,
			passwordHash
		} satisfies AuthUser;
	});
}
