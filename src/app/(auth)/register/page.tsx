import type { Metadata } from "next";
import AuthForm from "@/components/auth/auth-form";
import NameBodyHeader from "@/components/name-body-header";
import { writeLog } from "@/lib/log";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
	void writeLog("GET", "/register");
	
	return (
		<>
			<AuthForm type="register"
			          recaptchaSiteKey={process.env.RECAPTCHA_SITE_KEY}
			          recaptchaEnabled={!Boolean(Number(process.env.RECAPTCHA_ENABLED))}/>
			<NameBodyHeader className="register"/>
		</>
	);
}
