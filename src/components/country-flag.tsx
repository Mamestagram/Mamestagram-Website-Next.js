"use client";

import Tooltip from "./tooltip";

export default function CountryFlag({ code }: { code: string }) {
	return (
		<Tooltip className="country-flag" bubble description={code.toUpperCase()}>
			<i className={`flag-icon flag-icon-${code}`}></i>
		</Tooltip>
	);
}