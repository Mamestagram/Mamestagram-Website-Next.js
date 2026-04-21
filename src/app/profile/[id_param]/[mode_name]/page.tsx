import { notFound } from "next/navigation";

export default async function Profile({ params, searchParams }: {
	params: Promise<{
		id_param: string,
		mode_name: string
	}>,
	searchParams: Promise<{
		clan?: string,
		dans?: string
	}>
}) {
	const { id_param, mode_name } = await params;
	const { clan, dans } = await searchParams,
		isClan = clan !== undefined && clan ===
	return <></>;
}