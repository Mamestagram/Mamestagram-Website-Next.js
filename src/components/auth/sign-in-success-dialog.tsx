"use client";

import { useState } from "react";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { useUserContext } from "@/components/context/user-provider";

export default function SignInSuccessDialog() {
	const { userInfo } = useUserContext();
	const [isOpen, setIsOpen] = useState(userInfo.isLoggedIn);

	const closeDialog = () => {
		setIsOpen(false);
		const url = new URL(window.location.href);
		url.searchParams.delete("signin");
		window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
	};

	return (
		<ConfirmationDialog isOpen={isOpen}
		                    title="Sign in successful"
		                    description={userInfo.username
			                    ? <>Welcome back, <strong>{userInfo.username}</strong>. You have successfully signed in.</>
			                    : "You have successfully signed in."}
		                    icon="circle-check"
		                    confirmLabel="Continue"
		                    tone="success"
		                    singleAction
		                    onConfirm={closeDialog}
		                    onCancel={closeDialog}/>
	);
}
