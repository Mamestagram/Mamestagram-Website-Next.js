import type { QueryResult } from "mysql2";
import mysql from "mysql2";

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

export const executeQuery = <T>(query: string, args?: QueryArgs): Promise<T extends undefined ? QueryResult : T[]> => {
	return new Promise((resolve, reject) => {
		const questionSymbol = query.match(/\?/g)?.length ?? 0, argsSize = args?.length ?? 0;
		if (questionSymbol === argsSize) {
			try {
				pool.query(query, args, (err, result) => {
					if (err !== null) reject(err);
					else resolve(result as T extends undefined ? QueryResult : T[]);
				});
			}
			catch (err) {
				reject(err);
			}
		} else {
			reject(`Doesn't match number of arguments (question symbol: ${questionSymbol}, args: ${argsSize})`);
		}
	});
}