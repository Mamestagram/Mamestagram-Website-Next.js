import type { QueryResult } from "mysql2";
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
const pool = mysql.createPool({
	host,
	user,
	password,
	database,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 50
});

const getStatMode = (query: string) => {
	if (query.includes(StatMode.insert)) return StatMode.insert;
	else if (query.includes(StatMode.update)) return StatMode.update;
	else if (query.includes(StatMode.delete)) return StatMode.delete;
	else if (query.includes(StatMode.replace)) return StatMode.replace;
	else return StatMode.select;
}

export const executeQuery = <T>(query: string, args?: QueryArgs): Promise<T extends undefined ? QueryResult : T[]> => {
	return new Promise(async (resolve, reject) => {
		const questionSymbol = query.match(/\?/g)?.length ?? 0, argsSize = args?.length ?? 0;
		if (questionSymbol === argsSize) {
			const statMode = getStatMode(query);
			
			if (statMode === StatMode.select) {
				try {
					const [result] = await pool.query(query, args);
					resolve(result as T extends undefined ? QueryResult : T[]);
				}
				catch (err) {
					reject(err);
				}
			}
			else {
				const connection = await pool.getConnection();
				try {
					await connection.beginTransaction(); // start transaction
					const [result] = await connection.query(query, args);
					await connection.commit(); // commit
					resolve(result as T extends undefined ? QueryResult : T[]);
				}
				catch (err) {
					await connection.rollback(); // rollback
					reject(err);
				}
				finally {
					pool.releaseConnection(connection);
				}
			}
		}
		else {
			const errMsg = `Doesn't match number of arguments (question symbol: ${questionSymbol}, args: ${argsSize})`;
			console.error(`${errMsg}\n${query}\n${args}`);
			reject(errMsg);
		}
	});
}