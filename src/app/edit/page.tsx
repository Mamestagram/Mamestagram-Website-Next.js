import { redirect } from "next/navigation";

export default function LegacyEditPage() {
	redirect("/settings");
}
