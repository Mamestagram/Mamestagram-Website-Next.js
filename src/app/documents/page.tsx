import type { Metadata } from "next";
import type { Locale } from "@/app/api/documents/route";
import NameBodyHeader from "@/components/name-body-header";
import DocumentsContent from "@/components/documents/documents-content";
import { writeLog } from "@/lib/log";

export const metadata: Metadata = {
	title: "Documents",
	description: "Learn about Mamestagram, read the rules, connect to the server, and explore Dan courses."
};

type DocumentsPageProps = {
	searchParams: Promise<{ lang?: string | string[] }>;
};

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
	const { lang } = await searchParams;
	void writeLog("GET", `/documents (lang: ${lang})`);
	const locale: Locale = lang === "ja" ? "ja" : "en";

	return (
		<>
			<NameBodyHeader className="documents"/>
			<DocumentsContent locale={locale}/>
		</>
	);
}
