import bcrypt from "bcrypt";
import { createHash } from "crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { executeQuery, withTransaction } from "./connection";
import {
	createGachaStatsQuery,
	createStatsQuery,
	createUserQuery,
	registrationConflictQuery,
	userByIdQuery,
	userByLoginQuery
} from "./query/auth";

//
// TODO ユーザー情報はmamesosu apiから取ってくるようにする
//

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
		const [userResult] = await connection.query<ResultSetHeader>(
			createUserQuery,
			[username, safeName, email.toLowerCase(), passwordHash, country, now, now]
		);
		const id = userResult.insertId;
		const statsArgs = modes.flatMap((mode) => [id, mode]);

		await connection.query(
			createStatsQuery(modes.length),
			statsArgs
		);
		await connection.query(createGachaStatsQuery, [id]);

		return {
			id,
			priv: 1,
			username,
			country,
			passwordHash
		} satisfies AuthUser;
	});
}
