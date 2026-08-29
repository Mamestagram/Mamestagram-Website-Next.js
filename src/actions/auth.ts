"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
	createUser,
	findRegistrationConflict,
	getUserByLogin,
	verifyPassword,
} from "@/database/auth";
import { writeError } from "@/lib/log";
import {
	clearMamestagramOAuthTokens,
	loginMamestagramApiWithPassword,
} from "@/lib/mamestagram-oauth";
import {
	createRegistrationSuccessFlash,
	createSession,
	destroySession,
	getCurrentUser,
} from "@/lib/session";

export type AuthField =
	"username" | "email" | "password" | "confirmPassword" | "login" | "recaptcha";
export type AuthState = {
	message?: string;
	errors: Partial<Record<AuthField, string>>;
};

const field = (formData: FormData, name: string) =>
	String(formData.get(name) ?? "");

const verifyRecaptcha = async (token: string) => {
	if (Boolean(Number(process.env.RECAPTCHA_ENABLED))) return true;
	if (!token || !process.env.RECAPTCHA_SECRET_KEY) return false;
	
	try {
		const body = new URLSearchParams({
			secret: process.env.RECAPTCHA_SECRET_KEY,
			response: token,
		});
		const response = await fetch(
			"https://www.google.com/recaptcha/api/siteverify",
			{
				method: "POST",
				body,
				cache: "no-store",
			},
		);
		if (!response.ok) return false;
		const result = (await response.json()) as {
			success?: boolean;
			score?: number;
		};
		return (
			result.success === true &&
			(result.score === undefined || result.score >= 0.5)
		);
	} catch (error: unknown) {
		void writeError(error);
		return false;
	}
};

const getCountry = async () => {
	const requestHeaders = await headers();
	const country =
		requestHeaders.get("x-vercel-ip-country") ??
		requestHeaders.get("cf-ipcountry") ??
		"XX";
	return /^[a-z]{2}$/i.test(country) ? country.toLowerCase() : "xx";
};

const createOAuthTokenSession = async (
	user: Readonly<{ id: number; username: string }>,
	password: string,
	pathname: "/register" | "/signin",
) => {
	try {
		await loginMamestagramApiWithPassword(user.id, user.username, password);
	} catch (error: unknown) {
		await writeError(error, {
			source: "server",
			method: "POST",
			pathname,
			routeType: "oauth-password-grant",
		});
	}
};

export const register = async (
	_prevState: AuthState,
	formData: FormData,
): Promise<AuthState> => {
	const username = field(formData, "username").trim();
	const email = field(formData, "email").trim().toLowerCase();
	const password = field(formData, "password");
	const confirmPassword = field(formData, "confirmPassword");
	const errors: AuthState["errors"] = {};
	
	if (field(formData, "website"))
		return { errors: {}, message: "Registration could not be completed." };
	if (username.length < 2 || username.length > 15)
		errors.username = "Username must be between 2 and 15 characters.";
	else if (!/^[\p{L}\p{N}_\[\] -]+$/u.test(username))
		errors.username = "Username contains unsupported characters.";
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
		errors.email = "Enter a valid email address.";
	if (
		password.length < 8 ||
		password.length > 128 ||
		!/[A-Za-z]/.test(password) ||
		!/\d/.test(password)
	)
		errors.password = "Use 8–128 characters including letters and numbers.";
	if (confirmPassword !== password)
		errors.confirmPassword = "Passwords do not match.";
	if (Object.keys(errors).length > 0) return { errors };
	
	if (!(await verifyRecaptcha(field(formData, "recaptcha"))))
		return { errors: { recaptcha: "Verification failed. Please try again." } };
	
	try {
		const conflict = await findRegistrationConflict(username, email);
		if (conflict) {
			if (conflict.safe_name === username.toLowerCase().replaceAll(" ", "_"))
				errors.username = "This username is already in use.";
			if (conflict.email.toLowerCase() === email)
				errors.email = "This email address is already in use.";
			return { errors };
		}
		
		const user = await createUser({
			username,
			email,
			password,
			country: await getCountry(),
		});
		await createOAuthTokenSession(user, password, "/register");
		await createSession(user);
		await createRegistrationSuccessFlash();
	} catch (error: unknown) {
		await writeError(error);
		return {
			errors: {},
			message: "Registration could not be completed. Please try again later.",
		};
	}
	
	revalidatePath("/", "layout");
	redirect("/");
};

export const signin = async (
	_prevState: AuthState,
	formData: FormData,
): Promise<AuthState> => {
	const login = field(formData, "login").trim();
	const password = field(formData, "password");
	const errors: AuthState["errors"] = {};
	
	if (!login) errors.login = "Enter your username or email address.";
	if (!password) errors.password = "Enter your password.";
	if (Object.keys(errors).length > 0) return { errors };
	
	try {
		const user = await getUserByLogin(login);
		if (!user || !(await verifyPassword(password, user.passwordHash)))
			return {
				errors: {},
				message: "The username/email address or password is incorrect.",
			};
		await createOAuthTokenSession(user, password, "/signin");
		await createSession(user);
	} catch (error: unknown) {
		await writeError(error);
		return {
			errors: {},
			message: "Sign in is temporarily unavailable. Please try again later.",
		};
	}
	
	revalidatePath("/", "layout");
	redirect("/home?signin=success");
};

export const signout = async () => {
	const currentUser = await getCurrentUser();
	if (currentUser.isLoggedIn && currentUser.id) {
		try {
			await clearMamestagramOAuthTokens(currentUser.id);
		} catch (error: unknown) {
			await writeError(error, {
				source: "server",
				method: "POST",
				pathname: "/signout",
				routeType: "oauth-token-revocation",
			});
		}
	}
	await destroySession();
	revalidatePath("/", "layout");
	redirect("/");
};
