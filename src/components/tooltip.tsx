import classNames from "classnames";
import type { JSX, ReactNode } from "react";

export default function Tooltip({
	className,
	direction = "up",
	bubble = false,
	description,
	children
}: Readonly<{
	className?: string,
	direction?: "up" | "down",
	bubble?: boolean,
	description?: string | JSX.Element | null,
	children?: ReactNode
}>) {
	return (
		<span className={classNames("tooltip-element", direction, className)}>
			{children}
			{description !== undefined && description !== null &&
				<p className={classNames("tooltip", { ["bubble"]: bubble })}>{description}</p>}
		</span>
	);
}
