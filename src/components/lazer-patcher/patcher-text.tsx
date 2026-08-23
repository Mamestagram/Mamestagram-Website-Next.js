import { Fragment } from "react";
import type { LazerTextPart } from "@/app/api/lazer/route";

export default function PatcherText({ parts }: Readonly<{ parts: ReadonlyArray<LazerTextPart> }>) {
	return <>{parts.map((part, index) => {
		const key = `${index}-${part.text}`;
		if (part.style === "code") return <code key={key}>{part.text}</code>;
		if (part.style === "strong") return <strong key={key}>{part.text}</strong>;
		return <Fragment key={key}>{part.text}</Fragment>;
	})}</>;
}
