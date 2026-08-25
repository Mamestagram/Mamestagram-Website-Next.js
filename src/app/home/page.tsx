import AuthSuccessDialog from "@/components/auth/sign-in-success-dialog";
import HomeDashboard from "@/components/home/home-dashboard";
import NameBodyHeader from "@/components/name-body-header";
import { getHomeDashboard } from "@/database/home";
import { writeLog } from "@/lib/log";
import { getCurrentUser, hasRegistrationSuccessFlash } from "@/lib/session";

export default async function Home({ searchParams }: Readonly<{
	searchParams: Promise<{
		signin?: string | string[]
	}>
}>) {
	const { signin } = await searchParams;
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");
	const [dashboard, currentUser, registrationSucceeded] = await Promise.all([
		getHomeDashboard(),
		getCurrentUser(),
		hasRegistrationSuccessFlash()
	]);
	void writeLog("GET", "/");
	
	return (
		<>
			<NameBodyHeader className="home"/>
			<HomeDashboard {...dashboard} baseDomain={baseDomain} isLoggedIn={currentUser.isLoggedIn}/>
			{signin === "success" && <AuthSuccessDialog kind="signin"/>}
			{registrationSucceeded && <AuthSuccessDialog kind="registration"/>}
		</>
	);
}
