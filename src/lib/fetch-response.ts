import "server-only";

type FetchResponseOptions = {
	init?: Omit<RequestInit, "signal">,
	timeoutMs: number,
	transientRetries?: number
};

const RETRY_DELAY_MS = 120;

const waitForRetry = (attempt: number) => new Promise<void>((resolve) => {
	setTimeout(resolve, RETRY_DELAY_MS * attempt);
});

export const fetchResponse = async (
	input: string | URL,
	options: FetchResponseOptions
) => {
	const transientRetries = Math.max(0, options.transientRetries ?? 1);
	for (let attempt = 0; attempt <= transientRetries; attempt++) {
		try {
			return await fetch(input, {
				...options.init,
				signal: AbortSignal.timeout(options.timeoutMs)
			});
		}
		catch (error: unknown) {
			const canRetry = error instanceof TypeError && attempt < transientRetries;
			if (!canRetry) throw error;
			await waitForRetry(attempt + 1);
		}
	}

	throw new Error("Fetch retries were exhausted.");
};
