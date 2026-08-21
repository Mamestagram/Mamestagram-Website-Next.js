export type MutationResponse = {
	success: boolean,
	message: string
};

export const isMutationResponse = (value: unknown): value is MutationResponse => {
	if (typeof value !== "object" || value === null) return false;
	const response = value as Record<string, unknown>;
	return typeof response.success === "boolean" && typeof response.message === "string";
};

export const readMutationResponse = async (response: Response): Promise<MutationResponse> => {
	try {
		const body: unknown = await response.json();
		if (isMutationResponse(body)) return body;
	}
	catch {
		// The fallback below is used when the response is not JSON.
	}

	return {
		success: false,
		message: "The server returned an unexpected response."
	};
};
