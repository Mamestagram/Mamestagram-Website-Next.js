"use client";

import { useUserContext } from "@/components/context/user-provider";
import Image from "next/image";
import Link from "next/link";

export default function UserContainer() {
	const { serverInfo, userInfo } = useUserContext();
	
	if (userInfo.isLoggedIn) {
		return (
			<li className="avatar" title={userInfo.username}>
				<Image className="avatar-img"
				       src={`https://a.${serverInfo.baseDomain}/${userInfo.id}`}
				       alt=""
				       fill
				       sizes="(max-width: 768px) 100vw, 50vw"
				       priority/>
				{userInfo.badge !== 0 &&
					<Image className="gacha-badge"
					       src={`/image/gacha/${userInfo.badge}.${userInfo.badgeExt}`}
					       alt=""
					       fill
					       sizes="(max-width: 768px) 100vw, 50vw"
					       priority/>}
			</li>
		);
	}
	else {
		return (
			<>
				<li className="register">
					<span className="pipe"></span>
					<Link href="/register">Register</Link>
				</li>
				<li className="sign-in">
					<span className="pipe"></span>
					<Link href="/signin">Sign in</Link>
				</li>
			</>
		);
	}
}