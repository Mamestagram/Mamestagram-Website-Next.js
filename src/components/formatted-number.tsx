import styles from "@s/formatted-number.module.css";

export default function FormattedNumber({ value, locale = "en-US" }: Readonly<{
	value: number | string,
	locale?: string
}>) {
	const formattedValue = typeof value === "number" ? value.toLocaleString(locale) : value;
	
	return (
		<span className={styles.number} aria-label={formattedValue}>
			{formattedValue}
		</span>
	);
}
