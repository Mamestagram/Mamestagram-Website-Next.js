declare module "bcrypt" {
	type Callback<T> = (err: Error | undefined, result: T) => void;
	
	export function hash(data: string | Buffer, saltOrRounds: string | number): Promise<string>;
	export function hash(data: string | Buffer, saltOrRounds: string | number, callback: Callback<string>): void;
	
	export function compare(data: string | Buffer, encrypted: string): Promise<boolean>;
	export function compare(data: string | Buffer, encrypted: string, callback: Callback<boolean>): void;
	
	const bcrypt: {
		hash: typeof hash,
		compare: typeof compare
	};
	
	export default bcrypt;
}
