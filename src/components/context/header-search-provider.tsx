"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useRef, useState } from "react";

type HeaderSearchContextType = {
	isOpen: boolean,
	openSearch: (opener: HTMLButtonElement) => void,
	closeSearch: () => void
};

const HeaderSearchContext = createContext<HeaderSearchContextType | null>(null);

export const HeaderSearchProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
	const [isOpen, setIsOpen] = useState(false);
	const openerRef = useRef<HTMLButtonElement | null>(null);
	
	const openSearch = useCallback((opener: HTMLButtonElement) => {
		openerRef.current = opener;
		setIsOpen(true);
	}, []);
	
	const closeSearch = useCallback(() => {
		setIsOpen(false);
		requestAnimationFrame(() => openerRef.current?.focus());
	}, []);
	
	return (
		<HeaderSearchContext.Provider value={{ isOpen, openSearch, closeSearch }}>
			{children}
		</HeaderSearchContext.Provider>
	);
};

export const useHeaderSearch = () => {
	const context = useContext(HeaderSearchContext);
	if (context === null) throw new Error("HeaderSearchProvider is missing");
	return context;
};
