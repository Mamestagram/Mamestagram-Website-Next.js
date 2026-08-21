import FaqList from "@/components/faq-list";
import styles from "@s/documents.module.css";

export default function DocumentsFaqList({ faqs }: Readonly<{
	faqs: readonly (readonly [string, string])[]
}>) {
	return <FaqList items={faqs}
	                idPrefix="faq-answer"
	                classNames={{
		                list: styles.faq_list,
		                item: styles.faq_item,
		                question: styles.faq_question,
		                answer: styles.faq_answer
	                }}/>;
}
