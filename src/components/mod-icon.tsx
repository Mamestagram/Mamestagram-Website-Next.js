import classnames from "classnames";
import Tooltip from "@/components/tooltip";
import { Mods } from "@/lib/mods";

export default function ModIcon({ mod }: { mod: Mods }) {
	return (
		<Tooltip className={classnames("mod-icon", mod)} bubble description={mod}>
			{/* TODO */}
		</Tooltip>
	);
}