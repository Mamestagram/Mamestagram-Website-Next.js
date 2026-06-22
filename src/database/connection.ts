import type { Pool, QueryResult } from "mysql2/promise";
import mysql from "mysql2/promise";

enum StatMode {
	insert = "INSERT",
	update = "UPDATE",
	delete = "DELETE",
	replace = "REPLACE",
	select = "SELECT"
}

export type QueryArgs = (string | number | boolean)[] | null;

const [host, user, password, database] = [
	process.env.MYSQL_HOST,
	process.env.MYSQL_USER,
	process.env.MYSQL_PASS,
	process.env.MYSQL_DB
];

const globalMysql = globalThis as typeof globalThis & {
	MamestaServer?: Pool,
	Etternagram?: Pool
};

const pool = globalMysql.MamestaServer ?? mysql.createPool({
	host,
	user,
	password,
	database,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 100,
	enableKeepAlive: true,
	keepAliveInitialDelay: 0
});

globalMysql.MamestaServer = pool;

const getStatMode = (query: string) => {
	if (query.includes(StatMode.insert)) return StatMode.insert;
	else if (query.includes(StatMode.update)) return StatMode.update;
	else if (query.includes(StatMode.delete)) return StatMode.delete;
	else if (query.includes(StatMode.replace)) return StatMode.replace;
	else return StatMode.select;
}

export const executeQuery = async <T>(query: string, args?: QueryArgs, ignoreArgsCheck: boolean = false) => {
	const questionSymbol = query.match(/\?/g)?.length ?? 0, argsSize = args?.length ?? 0;
	if (ignoreArgsCheck || questionSymbol === argsSize) {
		const statMode = getStatMode(query);
		
		if (statMode === StatMode.select) {
			try {
				const [result] = await pool.query(query, args);
				return result as T extends undefined ? QueryResult : T[];
			}
			catch (err) {
				console.error(err);
				throw new Error(err instanceof Error ? err.message : "Unexpected error has occurred.");
			}
		}
		else {
			const connection = await pool.getConnection();
			try {
				await connection.beginTransaction(); // start transaction
				const [result] = await connection.query(query, args);
				await connection.commit(); // commit
				return result as T extends undefined ? QueryResult : T[];
			}
			catch (err) {
				await connection.rollback(); // rollback
				console.error(err);
				throw new Error(err instanceof Error ? err.message : "Unexpected error has occurred.");
			}
			finally {
				connection.release();
			}
		}
	}
	else {
		const errMsg = `Doesn't match number of arguments (question symbol: ${questionSymbol}, args: ${argsSize})`;
		console.error(`${errMsg}\n${query}\n${args}`);
		throw new Error(errMsg);
	}
}
