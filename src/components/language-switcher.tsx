"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type SupportedLocale = "en" | "ja";

export default function LanguageSwitcher({ className, current, label, ariaLabel }: Readonly<{
	className: string,
	current: SupportedLocale,
	label: string,
	ariaLabel: string
}>) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	const changeLanguage = (language: SupportedLocale) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("lang", language);
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	return (
		<div className={className}>
			<span>{label}</span>
			<div role="group" aria-label={ariaLabel}>
				{(["en", "ja"] as const).map((language) =>
					<button key={language}
					        type="button"
					        data-active={current === language}
					        aria-pressed={current === language}
					        onClick={() => changeLanguage(language)}>
						{language.toUpperCase()}
					</button>)}
			</div>
		</div>
	);
}
