import "server-only";

const getInternalApiUrl = (pathname: `/api/${string}`) => {
	if (!process.env.BASE_URL) throw new Error("BASE_URL is not configured");
	return new URL(pathname, process.env.BASE_URL);
};

export const fetchInternalJson = async <T>(pathname: `/api/${string}`): Promise<T> => {
	const response = await fetch(getInternalApiUrl(pathname));
	const data: unknown = await response.json();
	return data as T;
};
