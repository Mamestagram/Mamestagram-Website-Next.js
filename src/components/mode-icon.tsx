import type { VnMode } from "@/lib/mode";

export default function ModeIcon({ mode }: Readonly<{ mode: VnMode }>) {
	return <i className={`mode-icon mode-${mode}`}></i>;
}
