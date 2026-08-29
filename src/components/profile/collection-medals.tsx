import Image from "next/image";
import type { CSSProperties } from "react";
import styles from "@s/profile.module.css";

export default function CollectionMedals({
  imgSrc,
  collected,
  total,
}: Readonly<{
  imgSrc: string;
  collected: number;
  total: number;
}>) {
  const collectedRatio = total > 0 ? (collected / total) * 100 : 0;

  return (
    <>
      <Image
        className={styles.glay}
        src={imgSrc}
        alt="medal"
        fill
        draggable={false}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <Image
        className={styles.colored}
        src={imgSrc}
        alt="medal"
        fill
        draggable={false}
        data-theme-independent="true"
        style={{ "--collected-ratio": `${collectedRatio}%` } as CSSProperties}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </>
  );
}
