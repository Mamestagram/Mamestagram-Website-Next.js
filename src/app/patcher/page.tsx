import type { Metadata } from "next";
import NameBodyHeader from "@/components/name-body-header";
import PatcherContent from "@/components/patcher/patcher-content";

export const metadata: Metadata = {
	title: "Patcher",
	description: "Download Mamestagram Patcher and learn how to restore gameplay feedback during Relax play."
};

export default function PatcherPage() {
	return (
		<>
			<NameBodyHeader className="patcher"/>
			<PatcherContent/>
		</>
	);
}
