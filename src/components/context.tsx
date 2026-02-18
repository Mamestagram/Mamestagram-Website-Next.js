"use client";
import React, { createContext, useContext } from "react";

export type ServerInfo = {
	baseDomain: string;
};

export type UserInfo = {
    id?: number,
	clanId?: number,
	priv?: number,
    username?: string,
	country?: number,
	badge?: number,
	badgeExt?: "png" | "gif",
    isLoggedIn: boolean
};

type ContextType = {
    datetime: string,
	serverInfo: ServerInfo,
    userInfo: UserInfo
};

const UserContext = createContext<ContextType | null>(null);

export const UserProvider = ({ serverInfo, userInfo, children }: Readonly<{
	serverInfo: ServerInfo,
    userInfo: UserInfo,
    children: React.ReactNode
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
        <UserContext.Provider value={{ datetime, serverInfo, userInfo }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === null) throw new Error("UserProvidor is missing");
    return context;
}