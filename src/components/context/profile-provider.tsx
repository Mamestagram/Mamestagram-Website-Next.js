"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { Info } from "@/database/profile";
import { ModeNum } from "@/lib/mode";

type ProfileContextType = {
	id: number,
	mode: ModeNum,
	info: Info
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ id, mode, info, children }: Readonly<{
	id: number,
	mode: ModeNum,
	info: Info,
	children: ReactNode
}>) => {
	return (
		<ProfileContext.Provider value={{ id, mode, info }}>
			{children}
		</ProfileContext.Provider>
	);
}

export const useProfileContext = () => {
	const context = useContext(ProfileContext);
	if (context === null) throw new Error("ProfileProvidor is missing");
	return context;
}