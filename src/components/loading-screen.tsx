"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useUserContext } from "@/components/context/user-provider";
import styles from "@s/loading.module.css";

const isReadyMessage = (value: unknown): value is { type: "mamestagram:loading-ready" } =>
	typeof value === "object" && value !== null && "type" in value
	&& value.type === "mamestagram:loading-ready";

export default function LoadingScreen() {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [isReady, setIsReady] = useState(false);
	const { serverInfo, loadingScreenEmbedUrl } = useUserContext();
	const marketOrigin = `https://market.${serverInfo.baseDomain}`;

	useEffect(() => {
		if (!loadingScreenEmbedUrl) return;

		const receiveMessage = (event: MessageEvent<unknown>) => {
			if (event.origin !== marketOrigin) return;
			if (event.source !== iframeRef.current?.contentWindow) return;
			if (!isReadyMessage(event.data)) return;

			setIsReady(true);
			iframeRef.current.contentWindow?.postMessage(
				{ type: "mamestagram:loading-play" },
				marketOrigin
			);
		};

		window.addEventListener("message", receiveMessage);
		return () => window.removeEventListener("message", receiveMessage);
	}, [loadingScreenEmbedUrl, marketOrigin]);

	return (
		<section className={styles.screen}
		         data-embedded={Boolean(loadingScreenEmbedUrl)}
		         data-ready={isReady}
		         role="status"
		         aria-busy="true"
		         aria-label="Loading page">
			{loadingScreenEmbedUrl &&
				<iframe ref={iframeRef}
				        className={styles.market_frame}
				        data-ready={isReady}
				        src={loadingScreenEmbedUrl}
				        title="Loading screen"
				        sandbox="allow-scripts allow-same-origin"
				        referrerPolicy="no-referrer"/>}
			{!loadingScreenEmbedUrl &&
				<div className={styles.panel}>
					<span className={styles.logo_ring} aria-hidden="true">
						<Image className={styles.logo}
						       src="/images/logo.png"
						       alt="Mamestagram logo"
						       width={56}
						       height={56}
						       draggable={false}
						       priority/>
					</span>
					<span className={styles.label}>Loading...</span>
					<span className={styles.progress} aria-hidden="true"><i/></span>
				</div>}
		</section>
	);
}
