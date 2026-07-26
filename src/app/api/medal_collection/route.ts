import { NextResponse } from "next/server";

export enum CollectionType {
	all,
	skill,
	mod,
	others
}

export type CollectionStatusDesc = {
	type: CollectionType,
	name: string,
	description: string,
	condDescription: string,
	imgSrc: string
}[];

export const GET = (): NextResponse<CollectionStatusDesc> => {
	return NextResponse.json([
		{
			type: CollectionType.all,
			name: "Master of All Things Fun",
			description: "You know every corner of Mamestagram. Certified legend.",
			condDescription: "Collect all achievements.",
			imgSrc: "/images/medals/collection-master-of-all-things-fun.png"
		},
		{
			type: CollectionType.skill,
			name: "Welcome to the Inhuman Realm",
			description: "You have crossed the threshold — only the inhuman remain.",
			condDescription: "Collect all \"Skill\" achievements.",
			imgSrc: "/images/medals/collection-welcome-to-the-inhuman-realm.png"
		},
		{
			type: CollectionType.mod,
			name: "No Going Back",
			description: "You can no longer enjoy the game without a twist. Normal is boring.",
			condDescription: "Collect all \"Mod\" achievements.",
			imgSrc: "/images/medals/collection-no-going-back.png"
		},
		{
			type: CollectionType.others,
			name: "True Mamestagramer",
			description: "Proof that you live and breathe Mamestagram. All originals, all yours.",
			condDescription: "Collect all \"Mamestagram\" achievements.",
			imgSrc: "/images/medals/collection-true-mamestagramer.png"
		},
	]);
}