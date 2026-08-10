import SignInSuccessDialog from "@/components/auth/sign-in-success-dialog";
import NameBodyHeader from "@/components/name-body-header";
import { writeLog } from "@/lib/log";

export default async function Home({ searchParams }: Readonly<{
	searchParams: Promise<{ signin?: string | string[] }>
}>) {
	const { signin } = await searchParams;
	void writeLog("GET", "/");

	return (
		<>
			<NameBodyHeader className="home"/>
			{signin === "success" && <SignInSuccessDialog/>}
		</>
	);
}
