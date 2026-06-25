import { ModeNum } from "@/lib/mode";
import { ModNum } from "@/lib/mods";

export const dansGradeCountQuery = `
	SELECT grade, COUNT(*) AS count
	    FROM scores s
	JOIN danmaps d
	    ON map_md5 = md5
        AND s.mode = d.mode
	WHERE grade IN ('XH', 'X', 'SH', 'S', 'A')
	    AND status = 2
	    AND deleted = 0
	    AND (d.mods = ${ModNum.nm} OR (s.mods & d.mods) > 0) -- ModNum.nm = 0
	    AND (s.mode = ${ModeNum.ctb} OR (s.mods & ${ModNum.nf}) = 0) -- ModeNum.ctb = 2, ModNum.nf = 1 << 0
	    AND (s.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0 -- ModNum.ez = 1 << 1, ModNum.ht = 1 << 8, ModNum.rd = 1 << 21
	    AND s.acc >= d.acc
	    AND s.score >= d.score
	    AND max_combo >= pass_combo
	    AND (NOT s.mode = ${ModeNum.std} OR nmiss <= pass_miss) -- ModeNum.std = 0
	    AND userid = ? -- number
	    AND s.mode = ? -- ModeNum
	GROUP BY grade
`;

export const dansPPQuery = `
	SELECT SUM(reward_pp) AS pp
	    FROM dan_stats
	WHERE id = ? -- number
	    AND mode = ? -- ModeNum
`;

export const maniaDansPPQuery = `
	SELECT cs, SUM(reward_pp) AS pp
	    FROM dan_stats
	WHERE mode = ${ModeNum.mania}
	    AND id = ? -- number
	GROUP BY cs
`;

export const dansAccQuery = `
	SELECT IFNULL(AVG(s.acc), 0) AS avg_acc
	    FROM scores s
	JOIN danmaps d
	    ON map_md5 = md5
		AND s.mode = d.mode
	WHERE NOT grade IN ('F', 'N')
	    AND NOT status = 0
	    AND deleted = 0
	    AND (d.mods = ${ModNum.nm} OR (s.mods & d.mods) > 0) -- ModNum.nm = 0
	    AND (s.mode = ${ModeNum.ctb} OR (s.mods & ${ModNum.nf}) = 0) -- ModeNum.ctb = 2, ModNum.nf = 1 << 0
	    AND (s.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0 -- ModNum.ez = 1 << 1, ModNum.ht = 1 << 8, ModNum.rd = 1 << 21
	    AND s.acc >= d.acc
	    AND s.score >= d.score
	    AND max_combo >= pass_combo
	    AND (NOT s.mode = ${ModeNum.std} OR nmiss <= pass_miss) -- ModeNum.std = 0
	    AND userid = ? -- number
	    AND s.mode = ? -- ModeNum
`;

export const dansPlayCountQuery = `
	SELECT COUNT(*) AS count
	    FROM scores s
	JOIN danmaps d
	    ON map_md5 = md5
	WHERE deleted = 0
	    AND userid = ? -- number
	    AND s.mode = ? -- ModeNum
`;

export const dansMaxComboQuery = `
	SELECT IFNULL(MAX(max_combo), 0) AS combo
	    FROM scores s
	JOIN danmaps d
	    ON map_md5 = md5
        AND s.mode = d.mode
	WHERE NOT grade IN ('F', 'N')
	    AND NOT status = 0
	    AND deleted = 0
	    AND (d.mods = ${ModNum.nm} OR (s.mods & d.mods) > 0) -- ModNum.nm = 0
	    AND (s.mode = ${ModeNum.ctb} OR (s.mods & ${ModNum.nf}) = 0) -- ModeNum.ctb = 2, ModNum.nf = 1 << 0
	    AND (s.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0 -- ModNum.ez = 1 << 1, ModNum.ht = 1 << 8, ModNum.rd = 1 << 21
	    AND s.acc >= d.acc
	    AND s.score >= d.score
	    AND max_combo >= pass_combo
	    AND (NOT s.mode = ${ModeNum.std} OR nmiss <= pass_miss) -- ModeNum.std = 0
	    AND userid = ? -- number
	    AND s.mode = ? -- ModeNum
`;