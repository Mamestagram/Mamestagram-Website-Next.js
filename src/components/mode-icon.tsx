"use client";

import { VnMode } from "@/lib/mode";

export default function ModeIcon({ mode }: { mode: VnMode }) {
	return <i className={`mode-icon mode-${mode}`}></i>;
}