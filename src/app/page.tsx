import NameBodyHeader from "@/components/name-body-header";
import { writeLog } from "@/lib/log";

export default function Home() {
	void writeLog("GET", "/");

	return <><NameBodyHeader className="home"/></>;
}
