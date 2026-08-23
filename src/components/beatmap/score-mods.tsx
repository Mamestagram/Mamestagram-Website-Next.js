import { ModNum, Mods } from "@/lib/mods";
import styles from "@s/beatmap.module.css";

export type ModTone = "easy" | "hard" | "other";

export const modEntries: ReadonlyArray<{ mod: Mods, value: ModNum }> = [
	{ mod: Mods.nm, value: ModNum.nm },
	{ mod: Mods.nf, value: ModNum.nf },
	{ mod: Mods.ez, value: ModNum.ez },
	{ mod: Mods.ts, value: ModNum.ts },
	{ mod: Mods.hd, value: ModNum.hd },
	{ mod: Mods.hr, value: ModNum.hr },
	{ mod: Mods.sd, value: ModNum.sd },
	{ mod: Mods.dt, value: ModNum.dt },
	{ mod: Mods.rx, value: ModNum.rx },
	{ mod: Mods.ht, value: ModNum.ht },
	{ mod: Mods.nc, value: ModNum.nc },
	{ mod: Mods.fl, value: ModNum.fl },
	{ mod: Mods.at, value: ModNum.at },
	{ mod: Mods.so, value: ModNum.so },
	{ mod: Mods.ap, value: ModNum.ap },
	{ mod: Mods.pf, value: ModNum.pf },
	{ mod: Mods.k4, value: ModNum.k4 },
	{ mod: Mods.k5, value: ModNum.k5 },
	{ mod: Mods.k6, value: ModNum.k6 },
	{ mod: Mods.k7, value: ModNum.k7 },
	{ mod: Mods.k8, value: ModNum.k8 },
	{ mod: Mods.fi, value: ModNum.fi },
	{ mod: Mods.rd, value: ModNum.rd },
	{ mod: Mods.cm, value: ModNum.cm },
	{ mod: Mods.tr, value: ModNum.tr },
	{ mod: Mods.k9, value: ModNum.k9 },
	{ mod: Mods.kc, value: ModNum.kc },
	{ mod: Mods.k1, value: ModNum.k1 },
	{ mod: Mods.k3, value: ModNum.k3 },
	{ mod: Mods.k2, value: ModNum.k2 },
	{ mod: Mods.v2, value: ModNum.v2 },
	{ mod: Mods.mr, value: ModNum.mr }
];

export const isKnownMod = (mod: string): mod is Mods => modEntries.some((entry) => entry.mod === mod);

export const getScoreMods = (mods: number) => modEntries.filter(({ value }) => {
	if ((mods & value) === 0) return false;
	if (value === ModNum.dt && (mods & ModNum.nc) > 0) return false;
	return !(value === ModNum.sd && (mods & ModNum.pf) > 0);
});

const getModTone = (mod: Mods): ModTone => {
	if ([Mods.ez, Mods.nf, Mods.ht].includes(mod)) return "easy";
	if ([Mods.hr, Mods.sd, Mods.pf, Mods.dt, Mods.nc, Mods.fi, Mods.hd, Mods.fl].includes(mod))
		return "hard";
	return "other";
};

export default function ScoreMods({ mods }: Readonly<{ mods: number }>) {
	const scoreMods = getScoreMods(mods);
	if (scoreMods.length === 0) return <span className={styles.no_mod} data-tone="other">NM</span>;
	return (
		<span className={styles.mod_list}>
			{scoreMods.map(({ mod }) =>
				<span key={mod} className={styles.mod_badge} data-tone={getModTone(mod)}>
					{mod.toUpperCase()}
				</span>)}
		</span>
	);
}
