import FontAwesome from "@/components/font-awesome";

export default function SectionHeading({ className, icon, title, prefix = "fad" }: Readonly<{
	className: string,
	icon: string,
	title: string,
	prefix?: "fad" | "fab"
}>) {
	return (
		<div className={className}>
			<i><FontAwesome prefix={prefix} name={icon}/></i>
			<h2>{title}</h2>
		</div>
	);
}
