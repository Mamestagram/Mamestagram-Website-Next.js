"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { ProfileCosmetics } from "@/lib/profile-cosmetics";

export type ServerInfo = {
	baseDomain: string
};

export type UserInfo = {
	id?: number,
	clanId?: number,
	priv?: number,
	username?: string,
	country?: string,
	isLoggedIn: boolean
};

type UserContextType = {
	datetime: string,
	serverInfo: ServerInfo,
	userInfo: UserInfo,
	userCosmetics: ProfileCosmetics | null,
	loadingScreenEmbedUrl: string | null
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ serverInfo, userInfo, userCosmetics, loadingScreenEmbedUrl, children }: Readonly<{
	serverInfo: ServerInfo,
	userInfo: UserInfo,
	userCosmetics: ProfileCosmetics | null,
	loadingScreenEmbedUrl: string | null,
	children: ReactNode
}>) => {
	const datetime = new Date().toLocaleString("ja-JP", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"
	}).replace(/[\/\s:]/g, "");
	return (
		<UserContext.Provider value={{ datetime, serverInfo, userInfo, userCosmetics, loadingScreenEmbedUrl }}>
			{children}
		</UserContext.Provider>
	);
}

export const useUserContext = () => {
	const context = useContext(UserContext);
	if (context === null) throw new Error("UserProvidor is missing");
	return context;
}
