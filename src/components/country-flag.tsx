"use client";

import classNames from "classnames";
import Tooltip from "./tooltip";

export default function CountryFlag({ className, code }: Readonly<{
	className?: string,
	code: string
}>) {
	return (
		<Tooltip className={classNames("country-flag", className)} bubble description={code.toUpperCase()}>
			<i className={`fi fi-${code}`}></i>
		</Tooltip>
	);
}