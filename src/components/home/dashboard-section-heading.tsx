import Link from "next/link";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/home.module.css";

export default function DashboardSectionHeading({ icon, eyebrow, title, href, action }: Readonly<{
	icon: string,
	eyebrow: string,
	title: string,
	href?: string,
	action?: string
}>) {
	return (
		<div className={styles.section_heading}>
			<span className={styles.section_heading_icon}>
				<FontAwesome prefix="fad" name={icon}/>
			</span>
			<span className={styles.section_heading_copy}>
				<small>{eyebrow}</small>
				<h2>{title}</h2>
			</span>
			{href && action &&
				<Link className={styles.section_action} href={href}>
					{action}<FontAwesome prefix="fas" name="arrow-right"/>
				</Link>}
		</div>
	);
}
