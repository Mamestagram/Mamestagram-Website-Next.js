import { ModNum } from "@/lib/mods";
import { ModeNum } from "@/lib/mode";
import { Priv } from "@/lib/priv";

export const clanStatsSimpleAggQuery = `
	SELECT IFNULL(AVG(playtime), 0) AS playtime,
	       SUM(xh_count) AS xh_count,
	       SUM(x_count) AS x_count,
	       SUM(sh_count) AS sh_count,
	       SUM(s_count) AS s_count,
	       SUM(a_count) AS a_count,
	       IFNULL(AVG(total_hits), 0) AS total_hits,
	       MAX(max_combo) AS max_combo,
	       SUM(replay_views) AS replay_views
	    FROM stats s
	JOIN users u
	    ON s.id = u.id
	WHERE (priv & ${Priv.unrestricted}) > 0
	    AND NOT acc = 0
	    AND clan_id = ? -- number
	    AND mode = ? -- ModeNum
`;

export const clanStatsComplexAggQuery = `
	SELECT pp, pp_4k, pp_6k, pp_7k, pp_10k, acc, plays, rscore, tscore
	    FROM stats s
	JOIN users u
	    ON s.id = u.id
	WHERE (priv & ${Priv.unrestricted}) > 0
	    AND NOT acc = 0
	    AND clan_id = ? -- number
	    AND mode = ? -- ModeNum
`;

export const clanDanGradeCountQuery = `
	SELECT grade, COUNT(*) AS count
		FROM scores s
	JOIN danmaps d
		ON map_md5 = d.md5
		AND s.mode = d.mode
	JOIN users u
		ON userid = u.id
	WHERE grade IN ('XH', 'X', 'SH', 'S', 'A')
		AND NOT status = 0
		AND deleted = 0
		AND (priv & ${Priv.unrestricted}) > 0 -- Priv.unrestricted = 1 << 0
		AND (d.mods = ${ModNum.nm} OR (s.mods & d.mods) > 0) -- ModNum.nm = 0
		AND (s.mode = ${ModeNum.ctb} OR (s.mods & ${ModNum.nf}) = 0) -- ModeNum.ctb = 2, ModNum.nf = 1 << 0
		AND (s.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0 -- ModNum.ez = 1 << 1, ModNum.ht = 1 << 8, ModNum.rd = 1 << 21
		AND s.acc >= d.acc
		AND s.score >= d.score
		AND max_combo >= pass_combo
		AND (NOT s.mode = ${ModeNum.std} OR nmiss <= pass_miss) -- ModeNum.std = 0
		AND clan_id = ? -- number
		AND s.mode = ? -- ModeNum
	GROUP BY grade
`;

export const clanDanMaxComboQuery = `
	SELECT MAX(max_combo) AS combo
	    FROM scores s
	JOIN danmaps d
	    ON map_md5 = d.md5
	    AND s.mode = d.mode
	JOIN users u
	    ON userid = u.id
	WHERE NOT grade = 'F'
	    AND NOT status = 0
	    AND deleted = 0
	    AND (priv & ${Priv.unrestricted}) > 0 -- Priv.unrestricted = 1 << 0
	    AND (d.mods = ${ModNum.nm} OR (s.mods & d.mods) > 0) -- ModNum.nm = 0
	    AND (s.mode = ${ModeNum.ctb} OR (s.mods & ${ModNum.nf}) = 0) -- ModeNum.ctb = 2, ModNum.nf = 1 << 0
	    AND (s.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0 -- ModNum.ez = 1 << 1, ModNum.ht = 1 << 8, ModNum.rd = 1 << 21
	    AND s.acc >= d.acc
	    AND s.score >= d.score
	    AND max_combo >= pass_combo
	    AND (NOT s.mode = ${ModeNum.std} OR nmiss <= pass_miss) -- ModeNum.std = 0
	    AND clan_id = ? -- number
	    AND s.mode = ? -- ModeNum
`;

export const clanDanRewardAccPlaysQuery = `
	WITH dan_acc_plays AS (
	    SELECT userid, AVG(s.acc) AS acc, COUNT(*) AS plays
	        FROM scores s
	    JOIN users u
	        ON userid = u.id
	    JOIN danmaps d
	        ON map_md5 = md5
	        AND s.mode = d.mode
	    WHERE NOT grade = 'F'
	        AND NOT status = 0
	        AND deleted = 0
	        AND (priv & ${Priv.unrestricted}) > 0
	        AND (d.mods = ${ModNum.nm} OR (s.mods & d.mods) > 0)
	        AND (s.mode = ${ModeNum.ctb} OR (s.mods & ${ModNum.nf}) = 0)
	        AND (s.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0
	        AND s.acc >= d.acc
	        AND s.score >= d.score
	        AND max_combo >= pass_combo
	        AND (NOT s.mode = ${ModeNum.std} OR nmiss <= pass_miss)
	        AND clan_id = ? -- number
	        AND s.mode = ? -- ModeNum
	    GROUP BY userid
	), dan_pp AS (
	    SELECT d_s.id, SUM(reward_pp) AS pp
	        FROM dan_stats d_s
	    JOIN users u
	        ON d_s.id = u.id
	    WHERE (priv & ${Priv.unrestricted}) > 0
	        AND clan_id = ? -- number
	        AND mode = ? -- ModeNum
	    GROUP BY id
	)
	SELECT acc, plays, pp
	    FROM dan_pp d_pp
	JOIN dan_acc_plays d_a_p
	    ON d_pp.id = d_a_p.userid
`;

export const clanManiaDanPPQuery = `
	SELECT cs, SUM(reward_pp) AS pp
	    FROM dan_stats d_s
	JOIN users u
	    ON d_s.id = u.id
	WHERE (priv & ${Priv.unrestricted}) > 0 -- Priv.unrestricted = 1 << 0
	    AND EXISTS(
	        SELECT *
	            FROM scores s
	        JOIN danmaps d
	            ON map_md5 = d.md5
	            AND s.mode = d.mode
	        WHERE NOT grade = 'F'
	            AND NOT status = 0
	            AND deleted = 0
	            AND (d.mods = ${ModNum.nm} OR (s.mods & d.mods) > 0) -- ModNum.nm = 0
	            AND (s.mode = ${ModeNum.ctb} OR (s.mods & ${ModNum.nf}) = 0) -- ModeNum.ctb = 2, ModNum.nf = 1 << 0
	            AND (s.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0 -- ModNum.ez = 1 << 1, ModNum.ht = 1 << 8, ModNum.rd = 1 << 21
	            AND s.acc >= d.acc
	            AND s.score >= d.score
	            AND max_combo >= pass_combo
	            AND (NOT s.mode = ${ModeNum.std} OR nmiss <= pass_miss) -- ModeNum.std = 0
	            AND userid = d_s.id
	            AND s.mode = d_s.mode
	    ) = 1
	    AND mode = ${ModeNum.mania} -- ModeNum.mania = 3
	    AND clan_id = ? -- number
	GROUP BY cs, d_s.id
`;