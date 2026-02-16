import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "@awesome.me/kit-e4f71e6cea/icons";

type Brands = "b";
type Duotone = `d${"" | "r"}`;
type Custom = `k${"" | "d"}`;
type Regular = "r";
type Solid = Exclude<`s${("" | "d")}${"" | "r" | "s"}`, "sd">;
type Prefix = `fa${Brands | Duotone | Custom | Regular | Solid}`;

export default function FontAwesome({ prefix, name, className }: {
	prefix: Prefix,
	name: string,
	className?: string
}) {
	return <i className={className}><FontAwesomeIcon icon={byPrefixAndName[prefix][name]}/></i>;
}