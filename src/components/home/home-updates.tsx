import Link from "next/link";
import DashboardSectionHeading from "@/components/home/dashboard-section-heading";
import HomeUpdatesEditor from "@/components/home/home-updates-editor";
import HomeUpdatesList from "@/components/home/home-updates-list";
import { getHomeUpdates, HomeUpdatesSchemaError } from "@/database/home-updates";
import type { HomeUpdatesPage } from "@/lib/home-updates";
import { writeError } from "@/lib/log";
import { hasDeveloperAccess } from "@/lib/priv";
import { getCurrentUser } from "@/lib/session";
import styles from "@s/home.module.css";

export default async function HomeUpdates() {
	const user = await getCurrentUser();
	const canEdit = user.isLoggedIn && hasDeveloperAccess(user.priv);
	let page: HomeUpdatesPage = { items: [], nextCursor: null };
	let unavailable: string | null = null;
	try {
		page = await getHomeUpdates();
	} catch (error: unknown) {
		if (!(error instanceof HomeUpdatesSchemaError)) void writeError(error, { source: "server", pathname: "/home", routeType: "home-updates" });
		unavailable = canEdit && error instanceof HomeUpdatesSchemaError ? error.message : "News could not be loaded. Please try again later.";
	}
	const heading = <DashboardSectionHeading icon="clock-rotate-left" title="News"/>;
	return <section className={styles.dashboard_panel} data-page-enter="section">
		{canEdit ? <HomeUpdatesEditor page={page} unavailable={unavailable} heading={heading}/> : <>
			{heading}
			{unavailable ? <p className={styles.updates_empty}>News is currently unavailable.</p> : <HomeUpdatesList items={page.items}/>}
		</>}
		<Link className={styles.updates_button} href="/news">View all news</Link>
	</section>;
}
