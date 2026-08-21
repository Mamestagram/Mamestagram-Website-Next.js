"use client";

import { useEffect, useState } from "react";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { useUserContext } from "@/components/context/user-provider";

type AuthSuccessKind = "signin" | "registration";

const dialogCopy = {
	signin: {
		queryKey: "signin",
		title: "Sign in successful",
		fallback: "You have successfully signed in."
	},
	registration: {
		title: "Registration successful",
		fallback: "Your Mamestagram account has been created successfully."
	}
} as const;

export default function AuthSuccessDialog({ kind }: Readonly<{ kind: AuthSuccessKind }>) {
	const { userInfo } = useUserContext();
	const copy = dialogCopy[kind];
	const [isOpen, setIsOpen] = useState(kind === "registration" || userInfo.isLoggedIn);

	useEffect(() => {
		if (kind === "registration") {
			const secure = window.location.protocol === "https:" ? "; Secure" : "";
			document.cookie = `mamestagram-registration-success=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
			return;
		}
		const url = new URL(window.location.href);
		url.searchParams.delete(dialogCopy.signin.queryKey);
		window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
	}, [kind]);

	const description = userInfo.username
		? kind === "registration"
			? <>Welcome, <strong>{userInfo.username}</strong>. Your Mamestagram account has been created successfully.</>
			: <>Welcome back, <strong>{userInfo.username}</strong>. You have successfully signed in.</>
		: copy.fallback;

	return (
		<ConfirmationDialog isOpen={isOpen}
		                    title={copy.title}
		                    description={description}
		                    icon="circle-check"
		                    confirmLabel="Continue"
		                    tone="success"
		                    singleAction
		                    onConfirm={() => setIsOpen(false)}
		                    onCancel={() => setIsOpen(false)}/>
	);
}
