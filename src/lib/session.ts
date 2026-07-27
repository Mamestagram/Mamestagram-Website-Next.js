import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { UserInfo } from "@/components/context/user-provider";
import type { AuthUser } from "@/database/auth";
import { getUserById } from "@/database/auth";

const COOKIE_NAME = "mamestagram-session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

const sign = (payload: string, passwordHash: string) =>
	createHmac("sha256", passwordHash).update(payload).digest("base64url");

const serializeSession = (user: AuthUser) => {
	const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
	const payload = `${user.id}.${expiresAt}`;
	return `${payload}.${sign(payload, user.passwordHash)}`;
}

const parseSession = (token: string) => {
	const [idValue, expiresValue, signature, ...rest] = token.split(".");
	if (rest.length > 0 || !idValue || !expiresValue || !signature) return null;

	const id = Number(idValue), expiresAt = Number(expiresValue);
	if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(expiresAt)) return null;
	if (expiresAt <= Math.floor(Date.now() / 1000)) return null;

	return { id, expiresAt, signature, payload: `${id}.${expiresAt}` };
}

export const createSession = async (user: AuthUser) => {
	const cookieStore = await cookies();
	cookieStore.set(COOKIE_NAME, serializeSession(user), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: SESSION_DURATION_SECONDS
	});
}

export const destroySession = async () => {
	const cookieStore = await cookies();
	cookieStore.set(COOKIE_NAME, "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 0
	});
}

export const getCurrentUser = async (): Promise<UserInfo> => {
	try {
		const token = (await cookies()).get(COOKIE_NAME)?.value;
		if (!token) return { isLoggedIn: false };

		const session = parseSession(token);
		if (!session) return { isLoggedIn: false };

		const user = await getUserById(session.id);
		if (!user) return { isLoggedIn: false };

		const expected = Buffer.from(sign(session.payload, user.passwordHash), "base64url");
		const received = Buffer.from(session.signature, "base64url");
		if (expected.length !== received.length || !timingSafeEqual(expected, received))
			return { isLoggedIn: false };

		return {
			id: user.id,
			clanId: user.clanId,
			priv: user.priv,
			username: user.username,
			badge: 0,
			isLoggedIn: true
		};
	}
	catch {
		return { isLoggedIn: false };
	}
}
