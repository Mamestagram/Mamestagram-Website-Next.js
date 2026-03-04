"use client";

import { Mode } from "@/lib/mode";

export default function ModeIcon({ mode }: { mode: Mode }) {
	return <i className={`mode-icon mode-${Mode[mode]}`}></i>;
}