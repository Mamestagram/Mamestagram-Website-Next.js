import type { Metadata } from "next";
import AuthForm from "@/components/auth/auth-form";
import NameBodyHeader from "@/components/name-body-header";
import { writeLog } from "@/lib/log";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
	void writeLog("GET", "/signin");
	
	return (
		<>
			<AuthForm type="signin"/>
			<NameBodyHeader className="sign-in"/>
		</>
	);
}
