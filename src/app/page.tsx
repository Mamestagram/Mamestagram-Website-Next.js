import HomeMotion from "@/components/home/motion";
import { writeLog } from "@/lib/log";

export default function Home() {
	writeLog("GET", "/").then();
	
	return <><HomeMotion/></>;
}
