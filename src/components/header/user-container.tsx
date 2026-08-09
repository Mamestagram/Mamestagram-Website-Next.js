"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { signout } from "@/actions/auth";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { useUserContext } from "@/components/context/user-provider";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/user-container.module.css";

export default function UserContainer() {
	const { serverInfo, userInfo } = useUserContext();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isSignOutConfirmationOpen, setIsSignOutConfirmationOpen] = useState(false);
	const containerRef = useRef<HTMLLIElement>(null);
	const menuId = useId();

	useEffect(() => {
		if (!isMenuOpen) return;

		const closeOnOutsideClick = (event: PointerEvent) => {
			if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
				setIsMenuOpen(false);
				setIsSignOutConfirmationOpen(false);
			}
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsMenuOpen(false);
				setIsSignOutConfirmationOpen(false);
			}
		};

		document.addEventListener("pointerdown", closeOnOutsideClick);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsideClick);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [isMenuOpen]);

	if (userInfo.isLoggedIn) {
		return (
			<li ref={containerRef} className={`avatar ${styles.container}`}>
				<button className={styles.trigger}
				        type="button"
				        title={userInfo.username}
				        aria-label={`Open ${userInfo.username}'s account menu`}
				        aria-haspopup="menu"
				        aria-controls={menuId}
				        aria-expanded={isMenuOpen}
				        onClick={() => {
					        if (isMenuOpen) setIsSignOutConfirmationOpen(false);
					        setIsMenuOpen((isOpen) => !isOpen);
				        }}>
					<span className={styles.account_avatar}>
						<Image className="avatar-img"
						       src={`https://a.${serverInfo.baseDomain}/${userInfo.id}`}
						       alt=""
						       fill
						       draggable={false}
						       sizes="42px"
						       priority/>
						{userInfo.badge !== undefined && userInfo.badge !== 0 && userInfo.badgeExt !== undefined &&
							<Image className="gacha-badge"
							       src={`/images/gacha/${userInfo.badge}.${userInfo.badgeExt}`}
							       alt=""
							       fill
							       draggable={false}
							       sizes="42px"
							       priority/>}
					</span>
					<span className={styles.username}>{userInfo.username}</span>
				</button>

				<div id={menuId}
				     className={styles.menu}
				     role="menu"
				     data-open={isMenuOpen}
				     aria-hidden={!isMenuOpen}
				     inert={!isMenuOpen}>
					<Link href={`/profile/${userInfo.id}`} role="menuitem" onClick={() => {
						setIsMenuOpen(false);
						setIsSignOutConfirmationOpen(false);
					}}>
						<FontAwesome prefix="fad" name="user"/>
						<span>Profile</span>
					</Link>
					<Link href="/settings" role="menuitem" onClick={() => {
						setIsMenuOpen(false);
						setIsSignOutConfirmationOpen(false);
					}}>
						<FontAwesome prefix="fad" name="gear"/>
						<span>Settings</span>
					</Link>
					<div className={styles.sign_out_row} role="none">
						<button type="button"
						        role="menuitem"
						        onClick={() => {
							        setIsMenuOpen(false);
							        setIsSignOutConfirmationOpen(true);
						        }}>
							<FontAwesome prefix="fad" name="arrow-right-from-bracket"/>
							<span>Sign out</span>
						</button>
					</div>
				</div>

				<ConfirmationDialog isOpen={isSignOutConfirmationOpen}
				                    title="Sign out?"
				                    description="Are you sure you want to sign out?"
				                    icon="arrow-right-from-bracket"
				                    confirmAction={signout}
				                    onCancel={() => setIsSignOutConfirmationOpen(false)}/>
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
