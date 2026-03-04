import NameBodyHeader from "@/components/name-body-header";
import { writeLog } from "@/lib/log";

export default function Home() {
	writeLog("GET", "/").then();
	
	return <><NameBodyHeader className="home"/></>;
}
