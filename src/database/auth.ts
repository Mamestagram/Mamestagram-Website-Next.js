import bcrypt from "bcrypt";
import { createHash } from "crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { executeQuery, withTransaction } from "./connection";

export type AuthUser = {
	id: number,
	clanId?: number,
	priv: number,
	username: string,
	passwordHash: string
};

type AuthUserRow = RowDataPacket & {
	id: number,
	clan_id: number | null,
	priv: number,
	name: string,
	pw_bcrypt: string
};

export const makeSafeName = (username: string) => username.trim().toLowerCase().replaceAll(" ", "_");

const toAuthUser = (row: AuthUserRow): AuthUser => ({
	id: row.id,
	clanId: row.clan_id ?? undefined,
	priv: row.priv,
	username: row.name,
	passwordHash: row.pw_bcrypt
});

export const getUserByLogin = async (login: string) => {
	const normalizedLogin = login.trim().toLowerCase();
	const users = await executeQuery<AuthUserRow>(
		`
			SELECT id, clan_id, priv, name, pw_bcrypt
				FROM users
			WHERE safe_name = ?
				OR LOWER(email) = ?
			LIMIT 1
		`,
		[makeSafeName(login), normalizedLogin]
	);
	return users.at(0) ? toAuthUser(users.at(0)!) : null;
}

export const getUserById = async (id: number) => {
	const users = await executeQuery<AuthUserRow>(
		`
			SELECT id, clan_id, priv, name, pw_bcrypt
				FROM users
			WHERE id = ?
			LIMIT 1
		`,
		[id]
	);
	return users.at(0) ? toAuthUser(users.at(0)!) : null;
}

export const findRegistrationConflict = async (username: string, email: string) => {
	const users = await executeQuery<RowDataPacket & { safe_name: string, email: string }>(
		`
			SELECT safe_name, email
				FROM users
			WHERE safe_name = ?
				OR LOWER(email) = ?
			LIMIT 1
		`,
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
			`
				INSERT INTO users (name, safe_name, email, pw_bcrypt, country, creation_time, latest_activity)
				VALUES (?, ?, ?, ?, ?, ?, ?)
			`,
			[username, safeName, email.toLowerCase(), passwordHash, country, now, now]
		);
		const id = userResult.insertId;
		const statsPlaceholders = modes.map(() => "(?, ?)").join(", ");
		const statsArgs = modes.flatMap((mode) => [id, mode]);

		await connection.query(
			`INSERT INTO stats (id, mode) VALUES ${statsPlaceholders}`,
			statsArgs
		);
		await connection.query("INSERT INTO gacha_stats (id) VALUES (?)", [id]);

		return {
			id,
			priv: 1,
			username,
			passwordHash
		} satisfies AuthUser;
	});
}
