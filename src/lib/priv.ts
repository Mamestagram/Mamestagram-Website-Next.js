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
	const publicPrivileges = [
		Priv.verified,
		Priv.supporter,
		Priv.premium,
		Priv.alumni,
		Priv.tourneyManager,
		Priv.nominator,
		Priv.moderator,
		Priv.administrator,
		Priv.developer
	];
	return publicPrivileges.filter((privilege) => (privNum & privilege) === privilege);
}
