import type { Metadata } from "next";
import NameBodyHeader from "@/components/name-body-header";
import PatcherContent, { type LazerLocale } from "@/components/lazer-patcher/patcher-content";
import { writeLog } from "@/lib/log";

export const metadata: Metadata = {
	title: "Lazer",
	description: "Connect osu!lazer to Mamestagram on Windows and macOS with the official Lazer Patcher."
};

type LazerPageProps = {
	searchParams: Promise<{ lang?: string | string[] }>;
};

export default async function LazerPage({ searchParams }: LazerPageProps) {
	const { lang } = await searchParams;
	void writeLog("GET", `/lazer (lang: ${lang})`);
	const locale: LazerLocale = lang === "ja" ? "ja" : "en";

	return (
		<>
			<NameBodyHeader className="patcher"/>
			<PatcherContent locale={locale}/>
		</>
	);
}
