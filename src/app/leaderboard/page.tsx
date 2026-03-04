import NameBodyHeader from "@/components/name-body-header";
import { writeLog } from "@/lib/log";

export default function Leaderboard() {
	const segment = "leaderboard";
	writeLog("GET", `/${segment}`).then();
	
	return <><NameBodyHeader className={segment}/></>;
}