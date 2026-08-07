import classnames from "classnames";
import Tooltip from "@/components/tooltip";
import { Mods, ModFullName } from "@/lib/mods";

export default function ModIcon({ mod }: Readonly<{ mod: Mods }>) {
	return (
		<Tooltip className={classnames("mod-icon", mod)} bubble description={ModFullName[mod]}>
			{/* TODO */}
		</Tooltip>
	);
}
