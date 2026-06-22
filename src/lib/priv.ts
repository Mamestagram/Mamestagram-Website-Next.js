// noinspection JSUnusedGlobalSymbols
export enum Priv {
	unrestricted = 1 << 0,
	verified = 1 << 1,
	whitelisted = 1 << 2,
	supporter = 1 << 4,
	premium = 1 << 5,
	donator = supporter | premium,
	alumni = 1 << 7,
	tourneyManager = 1 << 10,
	nominator = 1 << 11,
	moderator = 1 << 12,
	administrator = 1 << 13,
	developer = 1 << 14,
	staff = moderator | administrator | developer
}

export const getPrivs = (privNum: number) => {
	const privs: Priv[] = [];
	Object.keys(Priv).reverse().forEach((key) => {
		const privKey = key as keyof typeof Priv;
		const conds = [
			(Priv[privKey] & (Priv.supporter | Priv.premium | Priv.moderator | Priv.administrator | Priv.developer)) === 0,
			(Priv[privKey] & (Priv.supporter | Priv.premium)) > 0 && !privs.includes(Priv.donator),
			(Priv[privKey] & (Priv.moderator | Priv.administrator | Priv.developer)) > 0 && !privs.includes(Priv.staff)
		]
		if ((privNum & Priv[privKey]) > 0 && conds.some((cond) => cond))
			privs.push(Priv[privKey]);
	});
	return privs.reverse();
}