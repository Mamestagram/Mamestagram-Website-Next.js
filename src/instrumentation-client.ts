type ClientErrorPayload = {
	name: string,
	message: string,
	stack?: string,
	source?: string,
	pathname: string
};

const MAX_CLIENT_VALUE_LENGTH = 8_000;
const recentErrors = new Map<string, number>();

const stringifyUnknown = (value: unknown) => {
	try {
		if (typeof value === "string") return value;
		return JSON.stringify(value) ?? String(value);
	} catch {
		return String(value);
	}
};

const normalizeError = (value: unknown, fallbackName: string): Omit<ClientErrorPayload, "pathname"> => {
	if (value instanceof Error) {
		return {
			name: value.name,
			message: value.message,
			stack: value.stack
		};
	}
	return { name: fallbackName, message: stringifyUnknown(value) };
};

const isBrowserExtensionSource = (source: string | undefined) =>
	Boolean(source && /^(?:chrome|moz|safari)-extension:/i.test(source));

const reportClientError = (payload: Omit<ClientErrorPayload, "pathname">) => {
	try {
		if (isBrowserExtensionSource(payload.source)) return;
		const normalized = {
			...payload,
			name: payload.name.slice(0, 120),
			message: payload.message.slice(0, MAX_CLIENT_VALUE_LENGTH),
			stack: payload.stack?.slice(0, MAX_CLIENT_VALUE_LENGTH),
			source: payload.source?.slice(0, 1_000),
			pathname: window.location.pathname.slice(0, 2_000)
		};
		const fingerprint = `${normalized.name}\u0000${normalized.message}\u0000${normalized.pathname}`;
		const now = Date.now();
		const lastReportedAt = recentErrors.get(fingerprint) ?? 0;
		if (now - lastReportedAt < 5_000) return;
		recentErrors.set(fingerprint, now);
		if (recentErrors.size > 100) {
			for (const [key, reportedAt] of recentErrors) {
				if (now - reportedAt >= 5_000) recentErrors.delete(key);
			}
		}
		
		void fetch("/api/client-errors", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(normalized),
			credentials: "same-origin",
			keepalive: true
		}).catch(() => undefined);
	} catch {
		// Error reporting must not affect the application.
	}
};

window.addEventListener("error", (event) => {
	const error = normalizeError(event.error ?? event.message, "ClientError");
	reportClientError({ ...error, source: event.filename });
});

window.addEventListener("unhandledrejection", (event) => {
	reportClientError(normalizeError(event.reason, "UnhandledPromiseRejection"));
});
