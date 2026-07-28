import type { Metadata } from "next";
import AuthForm from "@/components/auth/auth-form";
import NameBodyHeader from "@/components/name-body-header";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
	return (
		<>
			<AuthForm type="signin"/>
			<NameBodyHeader className="sign-in"/>
		</>
	);
}
