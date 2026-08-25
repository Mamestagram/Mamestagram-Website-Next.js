import type { DocumentsData } from "@/app/api/documents/route";
import { OsuMode } from "@/lib/mode";
import styles from "@s/documents.module.css";

type DanMode = DocumentsData["danModes"][number];

export default function DanRequirementsTable({ dan, headers }: {
	dan: DanMode,
	headers: readonly string[]
}) {
	const courseGroups = dan.requirements.reduce<DanMode["requirements"][]>((groups, requirement) => {
		const currentGroup = groups.at(-1);
		if (currentGroup?.[0].course === requirement.course) currentGroup.push(requirement);
		else groups.push([requirement]);
		return groups;
	}, []);
	
	return (
		<div className={styles.dan_table_scroll}>
			<table className={styles.dan_table}>
				<thead>
				<tr>{headers.map((header, index) =>
					(index !== 1 || dan.mode !== OsuMode.mania) && (index !== 2 || dan.mode === OsuMode.mania) &&
					<th key={header} data-optional={index === 2}>{header}</th>)}</tr>
				</thead>
				{courseGroups.map((group, groupIndex) =>
					<tbody key={`${group[0].course}-${groupIndex}`}>{group.map((requirement, index) =>
						<tr key={`${requirement.level ?? requirement.keys}-${index}`}>
							{index === 0 && <td data-course="true" rowSpan={group.length}>{requirement.course}</td>}
							{dan.mode !== OsuMode.mania &&
								<td data-level="true" data-numeric="true">{requirement.level}</td>}
							{dan.mode === OsuMode.mania && <td data-level="true" data-numeric="true"
							                                   data-optional="true">{requirement.keys ?? "—"}</td>}
							<td data-highlight={dan.mode !== OsuMode.taiko}
							    data-numeric="true">{requirement.accuracy}</td>
							<td data-highlight={dan.mode === OsuMode.taiko} data-numeric="true">{requirement.score}</td>
							<td data-highlight="true">{requirement.mod}</td>
							<td data-highlight={dan.mode === OsuMode.std} data-numeric="true">{requirement.misses}</td>
							<td data-highlight={dan.mode === OsuMode.std} data-numeric="true">{requirement.combo}</td>
						</tr>)}</tbody>)}
			</table>
		</div>
	);
}
