import { Fragment } from "react";
import styles from "@s/formatted-number.module.css";

export default function FormattedNumber({ value, locale = "en-US" }: Readonly<{
	value: number | string,
	locale?: string
}>) {
	const formattedValue = typeof value === "number" ? value.toLocaleString(locale) : value;
	const groups = formattedValue.split(",");

	return (
		<span className={styles.number} aria-label={formattedValue}>
			{groups.map((group, index) =>
				<Fragment key={`${group}-${index}`}>
					{index > 0 && <span className={styles.separator} aria-hidden="true">,</span>}
					{group}
				</Fragment>
			)}
		</span>
	);
}
