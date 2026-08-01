"use client";

import { useState } from "react";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/documents.module.css";

export default function FaqList({ faqs }: { faqs: readonly (readonly [string, string])[] }) {
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
		<div className={styles.faq_list}>
			{faqs.map(([question, answer], index) => {
				const isOpen = openItems.has(index);
				const answerId = `faq-answer-${index}`;
				return <div key={question} className={styles.faq_item} data-open={isOpen}>
					<button type="button"
					        className={styles.faq_question}
					        aria-expanded={isOpen}
					        aria-controls={answerId}
					        onClick={() => toggle(index)}>
						<span>Q{String(index + 1).padStart(2, "0")}</span>
						{question}
						<FontAwesome prefix="fas" name="plus"/>
					</button>
					<div id={answerId} className={styles.faq_answer} aria-hidden={!isOpen}><div><p>{answer}</p></div></div>
				</div>;
			})}
		</div>
	);
}
