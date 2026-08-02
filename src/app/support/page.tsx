import type { Metadata } from "next";
import NameBodyHeader from "@/components/name-body-header";
import SupportContent, { type SupportLocale } from "@/components/support/support-content";

export const metadata: Metadata = {
	title: "Support",
	description: "Support Mamestagram and explore the benefits included with Mamestagram Supporter."
};

type SupportPageProps = {
	searchParams: Promise<{ lang?: string | string[] }>;
};

export default async function SupportPage({ searchParams }: SupportPageProps) {
	const { lang } = await searchParams;
	const locale: SupportLocale = lang === "ja" ? "ja" : "en";

	return (
		<>
			<NameBodyHeader className="support"/>
			<SupportContent locale={locale}/>
		</>
	);
}
