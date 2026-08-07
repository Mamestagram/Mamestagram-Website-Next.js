import FaqList from "@/components/faq-list";
import styles from "@s/patcher.module.css";

export default function PatcherFaq({ items }: Readonly<{
	items: readonly (readonly [string, string])[]
}>) {
	return <FaqList items={items}
	                idPrefix="patcher-faq-answer"
	                classNames={{
		                list: styles.faq_list,
		                item: styles.faq_item,
		                question: styles.faq_question,
		                answer: styles.faq_answer
	                }}/>;
}
