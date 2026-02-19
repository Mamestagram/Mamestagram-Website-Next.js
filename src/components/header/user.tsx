"use client";

import { useUserContext } from "@/components/context";
import Image from "next/image";
import Link from "next/link";
import styles from "@s/common/header.module.css";

export default function UserHeader() {
	const { serverInfo, userInfo } = useUserContext();
	
	return userInfo.isLoggedIn
		? (
			<li className="avatar" title={userInfo.username}>
				<Image className="avatar-img" src={`https://a.${serverInfo.baseDomain}/${userInfo.id}`} alt="" fill priority/>
				{userInfo.badge !== 0 && <Image className="gacha-badge" src={`/image/gacha/${userInfo.badge}.${userInfo.badgeExt}`} alt="" fill priority/>}
			</li>
		)
		: (
			<>
				<li className="register">
					<Link href="/register">Register</Link>
				</li>
				<li className="sign-in">
					<Link href="/signin">Sign in</Link>
				</li>
			</>
		);
}