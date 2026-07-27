"use client";

import Link from "next/link";
import Script from "next/script";
import { useActionState, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { AuthState } from "@/actions/auth";
import { register, signin } from "@/actions/auth";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/auth.module.css";

declare global {
	interface Window {
		grecaptcha?: {
			execute: (siteKey: string, options: { action: string }) => Promise<string>,
			ready: (callback: () => void) => void
		};
	}
}

function PasswordField({ name, label, hint, error, autoComplete }: {
	name: "password" | "confirmPassword",
	label: string,
	hint?: string,
	error?: string,
	autoComplete: string
}) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className={styles.field}>
			<div className={styles.label_row}>
				<label htmlFor={name}>{label}</label>
				{hint && <span>{hint}</span>}
			</div>
			<div className={styles.password_field}>
				<input id={name}
				       name={name}
				       type={showPassword ? "text" : "password"}
				       autoComplete={autoComplete}
				       aria-invalid={Boolean(error)}
				       aria-describedby={error ? `${name}-error` : undefined}
				       required/>
				<button type="button"
				        aria-label={showPassword ? "Hide password" : "Show password"}
				        aria-pressed={showPassword}
				        onClick={() => setShowPassword((value) => !value)}>
					<FontAwesome prefix="fas" name={showPassword ? "eye-slash" : "eye"}/>
				</button>
			</div>
			{error && <p id={`${name}-error`} className={styles.field_error}>{error}</p>}
		</div>
	);
}

export default function AuthForm({ type, recaptchaSiteKey = "", recaptchaEnabled = false }: {
	type: "register" | "signin",
	recaptchaSiteKey?: string,
	recaptchaEnabled?: boolean
}) {
	const action = type === "register" ? register : signin;
	const [state, formAction, isPending] = useActionState(action, { errors: {} } satisfies AuthState);
	const formRef = useRef<HTMLFormElement>(null);
	const recaptchaRef = useRef<HTMLInputElement>(null);
	const [recaptchaReady, setRecaptchaReady] = useState(!recaptchaEnabled);

	useEffect(() => {
		if (recaptchaRef.current) recaptchaRef.current.value = "";
	}, [state]);

	const submitWithRecaptcha = async (event: FormEvent<HTMLFormElement>) => {
		if (type !== "register" || !recaptchaEnabled || recaptchaRef.current?.value) return;
		event.preventDefault();
		if (!window.grecaptcha || !recaptchaSiteKey) return;

		try {
			const token = await window.grecaptcha.execute(recaptchaSiteKey, { action: "register" });
			if (!recaptchaRef.current || !formRef.current) return;
			recaptchaRef.current.value = token;
			formRef.current.requestSubmit();
		}
		catch {
			setRecaptchaReady(false);
		}
	};

	return (
		<>
			{type === "register" && recaptchaEnabled && recaptchaSiteKey &&
				<Script src={`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(recaptchaSiteKey)}`}
				        strategy="afterInteractive"
				        onLoad={() => window.grecaptcha?.ready(() => setRecaptchaReady(true))}/>}
			<form ref={formRef} className={styles.form} action={formAction} onSubmit={submitWithRecaptcha}>
				<div className={styles.heading}>
					<span className={styles.eyebrow}>MAMESTAGRAM ACCOUNT</span>
					<h1>{type === "register" ? "Create your account" : "Welcome back"}</h1>
					<p>{type === "register"
						? "One account connects you to Mamestagram and the osu! client."
						: "Sign in with your Mamestagram username or email address."}</p>
				</div>

				{state.message && <p className={styles.form_error} role="alert">{state.message}</p>}

				{type === "register" ? (
					<>
						<div className={styles.field}>
							<div className={styles.label_row}>
								<label htmlFor="username">Username</label>
								<span>2–15 characters</span>
							</div>
							<input id="username"
							       name="username"
							       type="text"
							       autoComplete="username"
							       maxLength={15}
							       aria-invalid={Boolean(state.errors.username)}
							       aria-describedby={state.errors.username ? "username-error" : undefined}
							       required/>
							{state.errors.username && <p id="username-error" className={styles.field_error}>{state.errors.username}</p>}
						</div>
						<div className={styles.field}>
							<label htmlFor="email">Email address</label>
							<input id="email"
							       name="email"
							       type="email"
							       autoComplete="email"
							       aria-invalid={Boolean(state.errors.email)}
							       aria-describedby={state.errors.email ? "email-error" : undefined}
							       required/>
							{state.errors.email && <p id="email-error" className={styles.field_error}>{state.errors.email}</p>}
						</div>
						<PasswordField name="password"
						               label="Password"
						               hint="Letters + numbers, 8+ characters"
						               error={state.errors.password}
						               autoComplete="new-password"/>
						<PasswordField name="confirmPassword"
						               label="Confirm password"
						               error={state.errors.confirmPassword}
						               autoComplete="new-password"/>
						<div className={styles.honeypot} aria-hidden="true">
							<label htmlFor="website">Website</label>
							<input id="website" name="website" type="text" tabIndex={-1} autoComplete="off"/>
						</div>
						<input ref={recaptchaRef} type="hidden" name="recaptcha" defaultValue=""/>
						{state.errors.recaptcha && <p className={styles.field_error}>{state.errors.recaptcha}</p>}
					</>
				) : (
					<>
						<div className={styles.field}>
							<label htmlFor="login">Username or email address</label>
							<input id="login"
							       name="login"
							       type="text"
							       autoComplete="username"
							       aria-invalid={Boolean(state.errors.login)}
							       aria-describedby={state.errors.login ? "login-error" : undefined}
							       required/>
							{state.errors.login && <p id="login-error" className={styles.field_error}>{state.errors.login}</p>}
						</div>
						<PasswordField name="password"
						               label="Password"
						               error={state.errors.password}
						               autoComplete="current-password"/>
					</>
				)}

				<button className={styles.submit}
				        type="submit"
				        disabled={isPending || (type === "register" && !recaptchaReady)}>
					{isPending ? "Please wait…" : type === "register" ? "Register" : "Sign in"}
					<FontAwesome prefix="fas" name="arrow-right"/>
				</button>

				<p className={styles.reference}>
					{type === "register" ? "Already have an account?" : "New to Mamestagram?"}{" "}
					<Link href={type === "register" ? "/signin" : "/register"}>
						{type === "register" ? "Sign in" : "Create an account"}
					</Link>
				</p>
				{type === "register" && <p className={styles.notice}>Please do not create multiple accounts.</p>}
			</form>
		</>
	);
}
