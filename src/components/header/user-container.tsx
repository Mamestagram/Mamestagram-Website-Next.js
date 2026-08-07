"use client";

import { useUserContext } from "@/components/context/user-provider";
import Image from "next/image";
import Link from "next/link";
import { signout } from "@/actions/auth";

export default function UserContainer() {
	const { serverInfo, userInfo } = useUserContext();

	if (userInfo.isLoggedIn) {
		return (
			<li className="avatar" title={userInfo.username}>
				<Link className="account-avatar" href={`/profile/${userInfo.id}`} aria-label={`${userInfo.username}'s profile`}>
					<Image className="avatar-img"
					       src={`https://a.${serverInfo.baseDomain}/${userInfo.id}`}
					       alt="user-avatar"
					       fill
					       draggable={false}
					       sizes="42px"
					       priority/>
					{userInfo.badge !== undefined && userInfo.badge !== 0 && userInfo.badgeExt !== undefined &&
						<Image className="gacha-badge"
						       src={`/images/gacha/${userInfo.badge}.${userInfo.badgeExt}`}
						       alt="user-badge"
						       fill
						       draggable={false}
						       sizes="42px"
						       priority/>}
				</Link>
				<div className="account-actions">
					<Link href={`/profile/${userInfo.id}`}>{userInfo.username}</Link>
					<form action={signout}>
						<button type="submit">Sign out</button>
					</form>
				</div>
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
