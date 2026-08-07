import { redirect } from "next/navigation";

export default function NoParams() {
	redirect("leaderboard/std/performance");
}
