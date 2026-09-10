import { LanguageContent } from "../../language";
import { JSX } from "react";

export type HomeContent = LanguageContent & {
	heroTitle: string | JSX.Element
};

const homeContent: HomeContent = {
	heroTitle: <>Mamestagram <span>Dashboard</span></>,
};