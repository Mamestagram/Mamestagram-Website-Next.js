import FontAwesome from "@/components/font-awesome";

export default function SectionHeading({ className, icon, title }: Readonly<{
	className: string,
	icon: string,
	title: string
}>) {
	return (
		<div className={className}>
			<i><FontAwesome prefix="fad" name={icon}/></i>
			<h2>{title}</h2>
		</div>
	);
}
