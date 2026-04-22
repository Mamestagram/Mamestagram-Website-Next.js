import { executeQuery } from "./connect";
import { ModeNum, OsuMode } from "@/lib/mode";

export const getPreferredMode = async (id: number, isClan: boolean) => {
	// presonal
	if (!isClan) {
		const preferredModeNum = (await executeQuery<{ preferred_mode: ModeNum }>(
			`
			SELECT preferred_mode
				FROM users
			WHERE id = ?
			`,
			[id]
		)).at(0)?.preferred_mode;
		if (preferredModeNum !== undefined)
			return ModeNum[preferredModeNum] as OsuMode;
	}
	// clan
	else {
		const preferredModeNum = (await executeQuery<{ preferred_mode: ModeNum }>(
			`
			SELECT preferred_mode
				FROM clans
			WHERE id = ?
			`,
			[id]
		)).at(0)?.preferred_mode;
		if (preferredModeNum !== undefined)
			return ModeNum[preferredModeNum] as OsuMode;
	}
}

export const getInfo = async (id: number, isClan: boolean, isDans: boolean) => {

}