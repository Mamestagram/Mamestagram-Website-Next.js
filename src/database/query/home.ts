import { Priv } from "@/lib/priv";
import { ModeNum } from "@/lib/mode";

export const homeTopPlayersQuery = `
	SELECT ranked.id,
	       ranked.name,
	       ranked.country,
	       ranked.pp,
	       ranked.mode
		FROM (
			SELECT u.id,
			       u.name,
			       u.country,
			       s.pp,
			       s.mode,
			       ROW_NUMBER() OVER (
				       PARTITION BY s.mode
				       ORDER BY s.pp DESC, s.acc DESC, s.plays DESC
			       ) AS modeRank
				FROM stats s
			JOIN users u
				ON u.id = s.id
			WHERE s.mode IN (
				${ModeNum.std},
				${ModeNum.taiko},
				${ModeNum.ctb},
				${ModeNum.mania},
				${ModeNum.rxstd},
				${ModeNum.rxtaiko},
				${ModeNum.rxctb},
				${ModeNum.apstd}
			)
				AND u.id <> 1
				AND (u.priv & ${Priv.unrestricted}) > 0
				AND s.acc > 0
		) ranked
	WHERE ranked.modeRank = 1
	ORDER BY ranked.mode
`;

export const homeRecentActivityQuery = `
	SELECT s.id,
	       s.userid AS userId,
	       u.name,
	       u.country,
	       m.id AS mapId,
	       m.set_id AS setId,
	       m.artist,
	       m.title,
	       s.grade,
	       COALESCE(s.pp, 0) AS pp,
	       s.acc AS accuracy,
	       s.mode,
	       s.play_time AS playTime
		FROM (
			SELECT id,
			       userid,
			       map_md5,
			       score,
			       grade,
			       pp,
			       acc,
			       mode,
			       play_time
				FROM scores
			WHERE deleted = 0
				AND status <> 0
				AND grade NOT IN ('F', 'N')
			ORDER BY id DESC
			LIMIT 80
		) s
	JOIN users u
		ON u.id = s.userid
	JOIN maps m
		ON m.md5 = s.map_md5
	WHERE (u.priv & ${Priv.unrestricted}) > 0
		AND NOT EXISTS (
			SELECT 1
				FROM scores earlierScore
			JOIN users earlierUser
				ON earlierUser.id = earlierScore.userid
			WHERE earlierScore.map_md5 = s.map_md5
				AND earlierScore.mode = s.mode
				AND earlierScore.id < s.id
				AND earlierScore.score > s.score
				AND earlierScore.deleted = 0
				AND earlierScore.status <> 0
				AND earlierScore.grade NOT IN ('F', 'N')
				AND (earlierUser.priv & ${Priv.unrestricted}) > 0
		)
	ORDER BY s.id DESC
	LIMIT 6
`;
