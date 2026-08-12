"use client";

import { useState } from "react";
import FontAwesome from "@/components/font-awesome";

type FaqClassNames = {
	list: string,
	item: string,
	question: string,
	answer: string
};

export default function FaqList({ items, idPrefix, classNames }: Readonly<{
	items: readonly (readonly [string, string])[],
	idPrefix: string,
	classNames: FaqClassNames
}>) {
	const [openItems, setOpenItems] = useState<Set<number>>(() => new Set([0]));

	const toggle = (index: number) => {
		setOpenItems((current) => {
			const next = new Set(current);
			if (next.has(index)) next.delete(index);
			else next.add(index);
			return next;
		});
	};

	return (
		<div className={classNames.list}>
			{items.map(([question, answer], index) => {
				const isOpen = openItems.has(index);
				const answerId = `${idPrefix}-${index}`;
				return (
					<div key={question} className={classNames.item} data-open={isOpen} data-page-enter="box">
						<button type="button"
						        className={classNames.question}
						        aria-expanded={isOpen}
						        aria-controls={answerId}
						        onClick={() => toggle(index)}>
							<span>Q{String(index + 1).padStart(2, "0")}</span>
							{question}
							<FontAwesome prefix="fas" name="plus"/>
						</button>
						<div id={answerId} className={classNames.answer} aria-hidden={!isOpen}>
							<div><p>{answer}</p></div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
