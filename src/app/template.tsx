import type { ReactNode } from "react";
import styles from "@s/loading.module.css";

export default function Template({ children }: Readonly<{ children: ReactNode }>) {
	return <div className={styles.page}>{children}</div>;
}
