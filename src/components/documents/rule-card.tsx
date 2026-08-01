import FontAwesome from "@/components/font-awesome";
import styles from "@s/documents.module.css";

export default function RuleCard({ icon, title, rules }: {
	icon: string,
	title: string,
	rules: readonly string[]
}) {
	return (
		<article className={styles.rule_card}>
			<div><i><FontAwesome prefix="fad" name={icon}/></i><h3>{title}</h3></div>
			<ol>{rules.map((rule, index) => <li key={rule}><span>{index + 1}</span><p>{rule}</p></li>)}</ol>
		</article>
	);
}
