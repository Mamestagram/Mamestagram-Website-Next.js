"use client";

import classNames from "classnames";
import React from "react";

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
	description?: string,
	children?: React.ReactNode
}>) {
	return (
		<span className={classNames("tooltip-element", direction, className)}>
			{children}
			<p className={classNames("tooltip", { ["bubble"]: bubble })}>{description}</p>
		</span>
	);
}