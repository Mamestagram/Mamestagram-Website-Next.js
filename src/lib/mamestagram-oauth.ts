import "server-only";

import { randomBytes } from "node:crypto";
import { getRedisClient } from "@/database/redis";

const OAUTH_TOKEN_TTL_SECONDS = 31 * 24 * 60 * 60;
const OAUTH_REFRESH_LOCK_MS = 17_000;
const OAUTH_REFRESH_WAIT_ATTEMPTS = 170;
const OAUTH_REFRESH_WAIT_MS = 100;
const OAUTH_REQUEST_TIMEOUT_MS = 15_000;
const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 30_000;

export type FriendAction = "follow" | "unfollow";

type OAuthConfiguration = {
	apiBaseUrl: URL;
	clientId: string;
	clientSecret: string;
	scope: string;
};

type OAuthTokenSet = {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
	scope: string;
};

type OAuthTokenResponse = {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
	scope: string;
};

export class OAuthAuthorizationRequiredError extends Error {
	constructor() {
		super("Mamestagram API authorization is required.");
		this.name = "OAuthAuthorizationRequiredError";
	}
}

export class MamestagramApiError extends Error {
	readonly status: number;
	readonly code: string;
	readonly hint: string;
	
	constructor(message: string, { status = 0, code = "", hint = "" } = {}) {
		super(message);
		this.name = "MamestagramApiError";
		this.status = status;
		this.code = code;
		this.hint = hint;
	}
}

const getRequiredEnvironmentValue = (name: string) => {
	const value = process.env[name]?.trim();
	if (!value) throw new Error(`${name} is not configured`);
	return value;
};

const getOAuthConfiguration = (): OAuthConfiguration => {
	const apiBaseUrl = new URL(getRequiredEnvironmentValue("API_BASE_URL"));
	if (apiBaseUrl.protocol !== "https:" && apiBaseUrl.hostname !== "localhost")
		throw new Error("API_BASE_URL must use HTTPS");
	
	const scope = getRequiredEnvironmentValue("OAUTH_SCOPE");
	const scopes = new Set(scope.split(/\s+/u));
	if (
		!scopes.has("*") &&
		(!scopes.has("identify") || !scopes.has("friends:write"))
	)
		throw new Error("OAUTH_SCOPE must include identify and friends:write");
	
	return {
		apiBaseUrl,
		clientId: getRequiredEnvironmentValue("OAUTH_CLIENT_ID"),
		clientSecret: getRequiredEnvironmentValue("OAUTH_CLIENT_SECRET"),
		scope,
	};
};

const getApiUrl = (configuration: OAuthConfiguration, pathname: string) => {
	const url = new URL(pathname, configuration.apiBaseUrl);
	if (url.origin !== configuration.apiBaseUrl.origin)
		throw new Error("The API request must use the configured origin");
	return url;
};

const getTokenKey = (userId: number) =>
	`mamestagram:web:oauth:tokens:${userId}`;

const getRefreshLockKey = (userId: number) =>
	`mamestagram:web:oauth:refresh-lock:${userId}`;

const parseJsonRecord = (value: string): Record<string, unknown> | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		return typeof parsed === "object" && parsed !== null
			? (parsed as Record<string, unknown>)
			: null;
	} catch {
		return null;
	}
};

const parseOAuthTokenSet = (value: string | null): OAuthTokenSet | null => {
	if (!value) return null;
	const token = parseJsonRecord(value);
	if (!token) return null;
	if (
		typeof token.accessToken !== "string" ||
		typeof token.refreshToken !== "string" ||
		typeof token.expiresAt !== "number" ||
		!Number.isFinite(token.expiresAt) ||
		typeof token.scope !== "string"
	)
		return null;
	return {
		accessToken: token.accessToken,
		refreshToken: token.refreshToken,
		expiresAt: token.expiresAt,
		scope: token.scope,
	};
};

const parseOAuthTokenResponse = (
	value: unknown,
	fallbackScope: string,
): OAuthTokenResponse => {
	if (typeof value !== "object" || value === null)
		throw new MamestagramApiError(
			"Mamestagram returned an incomplete OAuth token response.",
		);
	const response = value as Record<string, unknown>;
	const scope =
		typeof response.scope === "string" ? response.scope : fallbackScope;
	const scopes = new Set(scope.split(/\s+/u));
	if (
		typeof response.access_token !== "string" ||
		!response.access_token ||
		typeof response.refresh_token !== "string" ||
		!response.refresh_token ||
		typeof response.expires_in !== "number" ||
		!Number.isFinite(response.expires_in) ||
		response.expires_in <= 0 ||
		(typeof response.token_type === "string" &&
			response.token_type.toLowerCase() !== "bearer") ||
		(!scopes.has("*") && !scopes.has("friends:write"))
	)
		throw new MamestagramApiError(
			"Mamestagram returned an incomplete OAuth token response.",
		);
	return {
		accessToken: response.access_token,
		refreshToken: response.refresh_token,
		expiresIn: response.expires_in,
		scope,
	};
};

const readResponsePayload = async (response: Response) => {
	const raw = await response.text();
	if (!raw) return null;
	try {
		const payload: unknown = JSON.parse(raw);
		return payload;
	} catch {
		throw new MamestagramApiError(
			`Mamestagram returned HTTP ${response.status} with non-JSON content.`,
			{ status: response.status },
		);
	}
};

const getApiErrorDetails = (value: unknown) => {
	if (typeof value !== "object" || value === null)
		return { code: "api_error", hint: "" };
	const error = value as Record<string, unknown>;
	const codeValue = error.error ?? error.detail;
	const hintValue = error.hint ?? error.message;
	return {
		code: typeof codeValue === "string" ? codeValue : "api_error",
		hint: typeof hintValue === "string" ? hintValue.slice(0, 240) : "",
	};
};

const throwForError = (response: Response, payload: unknown) => {
	if (response.ok) return;
	const { code, hint } = getApiErrorDetails(payload);
	const message = hint
		? `Mamestagram API returned HTTP ${response.status}: ${hint}`
		: `Mamestagram API returned HTTP ${response.status}: ${code}`;
	throw new MamestagramApiError(message, {
		status: response.status,
		code,
		hint,
	});
};

const requestToken = async (
	fields: Record<string, string>,
	fallbackScope: string,
) => {
	const configuration = getOAuthConfiguration();
	const form = new URLSearchParams({
		client_id: configuration.clientId,
		client_secret: configuration.clientSecret,
		...fields,
	});
	const response = await fetch(getApiUrl(configuration, "/lazer/oauth/token"), {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: form,
		cache: "no-store",
		signal: AbortSignal.timeout(OAUTH_REQUEST_TIMEOUT_MS),
	});
	const payload = await readResponsePayload(response);
	throwForError(response, payload);
	return parseOAuthTokenResponse(payload, fallbackScope);
};

const storeOAuthTokenSet = async (
	userId: number,
	response: OAuthTokenResponse,
) => {
	const redis = await getRedisClient();
	const token: OAuthTokenSet = {
		accessToken: response.accessToken,
		refreshToken: response.refreshToken,
		expiresAt: Date.now() + response.expiresIn * 1_000,
		scope: response.scope,
	};
	await redis.set(getTokenKey(userId), JSON.stringify(token), {
		EX: OAUTH_TOKEN_TTL_SECONDS,
	});
	return token;
};

const getStoredOAuthTokenSet = async (userId: number) => {
	const redis = await getRedisClient();
	const key = getTokenKey(userId);
	const stored = await redis.get(key);
	const token = parseOAuthTokenSet(stored);
	if (!token && stored !== null) await redis.del(key);
	return token;
};

export const clearMamestagramOAuthTokens = async (userId: number) => {
	const redis = await getRedisClient();
	await redis.del(getTokenKey(userId));
};

const releaseRefreshLock = async (key: string, value: string) => {
	const redis = await getRedisClient();
	await redis.eval(
		"if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
		{ keys: [key], arguments: [value] },
	);
};

const waitForRefreshedToken = async (
	userId: number,
	previousAccessToken: string,
) => {
	for (let attempt = 0; attempt < OAUTH_REFRESH_WAIT_ATTEMPTS; attempt += 1) {
		await new Promise((resolve) => setTimeout(resolve, OAUTH_REFRESH_WAIT_MS));
		const token = await getStoredOAuthTokenSet(userId);
		if (!token) throw new OAuthAuthorizationRequiredError();
		if (token.accessToken !== previousAccessToken) return token;
	}
	throw new Error("Timed out while waiting for the OAuth token to refresh");
};

const refreshOAuthTokenSet = async (
	userId: number,
	previousAccessToken: string,
) => {
	const redis = await getRedisClient();
	const lockKey = getRefreshLockKey(userId);
	const lockValue = randomBytes(24).toString("base64url");
	const lockAcquired = await redis.set(lockKey, lockValue, {
		NX: true,
		PX: OAUTH_REFRESH_LOCK_MS,
	});
	if (lockAcquired !== "OK")
		return waitForRefreshedToken(userId, previousAccessToken);
	
	try {
		const currentToken = await getStoredOAuthTokenSet(userId);
		if (!currentToken) throw new OAuthAuthorizationRequiredError();
		if (currentToken.accessToken !== previousAccessToken) return currentToken;
		
		try {
			const response = await requestToken(
				{
					grant_type: "refresh_token",
					refresh_token: currentToken.refreshToken,
				},
				currentToken.scope,
			);
			return storeOAuthTokenSet(userId, response);
		} catch (error: unknown) {
			if (
				error instanceof MamestagramApiError &&
				(error.status === 400 || error.status === 401)
			) {
				await redis.del(getTokenKey(userId));
				throw new OAuthAuthorizationRequiredError();
			}
			throw error;
		}
	} finally {
		await releaseRefreshLock(lockKey, lockValue).catch(() => undefined);
	}
};

const getOAuthAccessToken = async (userId: number) => {
	const token = await getStoredOAuthTokenSet(userId);
	if (!token) throw new OAuthAuthorizationRequiredError();
	if (token.expiresAt - ACCESS_TOKEN_EXPIRY_BUFFER_MS > Date.now())
		return token.accessToken;
	return (await refreshOAuthTokenSet(userId, token.accessToken)).accessToken;
};

const requestAuthenticatedJson = async (
	pathname: string,
	accessToken: string,
	options: Pick<RequestInit, "method" | "body"> = {},
) => {
	const configuration = getOAuthConfiguration();
	const response = await fetch(getApiUrl(configuration, pathname), {
		...options,
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
		cache: "no-store",
		signal: AbortSignal.timeout(OAUTH_REQUEST_TIMEOUT_MS),
	});
	const payload = await readResponsePayload(response);
	throwForError(response, payload);
	return payload;
};

export const loginMamestagramApiWithPassword = async (
	userId: number,
	username: string,
	password: string,
) => {
	const configuration = getOAuthConfiguration();
	const response = await requestToken(
		{
			grant_type: "password",
			username,
			password,
			scope: configuration.scope,
		},
		configuration.scope,
	);
	const identity = await requestAuthenticatedJson(
		"/lazer/api/v2/me",
		response.accessToken,
	);
	if (
		typeof identity !== "object" ||
		identity === null ||
		(identity as Record<string, unknown>).id !== userId
	)
		throw new Error(
			"The authorized Mamestagram account does not match the signed-in account",
		);
	await storeOAuthTokenSet(userId, response);
};

const requestFriendMutation = async (
	accessToken: string,
	targetUserId: number,
	action: FriendAction,
) => {
	const pathname =
		action === "follow"
			? `/v1/add_friend?userid=${targetUserId}`
			: `/v1/remove_friend?userid=${targetUserId}`;
	const configuration = getOAuthConfiguration();
	return fetch(getApiUrl(configuration, pathname), {
		method: action === "follow" ? "POST" : "DELETE",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
		cache: "no-store",
		signal: AbortSignal.timeout(OAUTH_REQUEST_TIMEOUT_MS),
	});
};

export const mutateFriendRelationship = async (
	userId: number,
	targetUserId: number,
	action: FriendAction,
) => {
	let accessToken = await getOAuthAccessToken(userId);
	let response = await requestFriendMutation(accessToken, targetUserId, action);
	if (response.status === 401) {
		accessToken = (await refreshOAuthTokenSet(userId, accessToken)).accessToken;
		response = await requestFriendMutation(accessToken, targetUserId, action);
	}
	if (response.status === 401) {
		await clearMamestagramOAuthTokens(userId);
		throw new OAuthAuthorizationRequiredError();
	}
	const payload = await readResponsePayload(response);
	throwForError(response, payload);
};
