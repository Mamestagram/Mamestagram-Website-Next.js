import type { Metadata } from "next";
import NameBodyHeader from "@/components/name-body-header";
import DocumentsContent from "@/components/documents/documents-content";

export const metadata: Metadata = {
	title: "Documents",
	description: "Learn about Mamestagram, read the rules, connect to the server, and explore Dan courses."
};

export default function DocumentsPage() {
	return (
		<>
			<NameBodyHeader className="documents"/>
			<DocumentsContent/>
		</>
	);
}
