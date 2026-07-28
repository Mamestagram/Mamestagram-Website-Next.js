import type { Metadata } from "next";
import AuthForm from "@/components/auth/auth-form";
import NameBodyHeader from "@/components/name-body-header";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
	return (
		<>
			<AuthForm type="register"
			          recaptchaSiteKey={process.env.RECAPTCHA_SITE_KEY}
			          recaptchaEnabled={!Boolean(Number(process.env.LOCAL_ONLY))}/>
			<NameBodyHeader className="register"/>
		</>
	);
}
