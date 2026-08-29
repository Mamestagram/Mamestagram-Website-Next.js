"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { readMutationResponse } from "@/lib/mutation-response";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/profile.module.css";

export default function FollowButton({
  targetUserId,
  username,
  initialIsFollowing,
}: Readonly<{
  targetUserId: number;
  username: string;
  initialIsFollowing: boolean;
}>) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const updateRelationship = () => {
    setMessage("");
    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/profile/relationship/${targetUserId}`,
          {
            method: isFollowing ? "DELETE" : "POST",
            credentials: "same-origin",
            headers: {
              Accept: "application/json",
            },
          },
        );
        const result = await readMutationResponse(response);
        if (!response.ok || !result.success) {
          setMessage(result.message);
          return;
        }

        setIsFollowing((current) => !current);
        router.refresh();
      } catch {
        setMessage("The relationship could not be updated.");
      }
    });
  };

  const actionLabel = isFollowing ? "Unfollow" : "Follow";

  return (
    <span className={styles.follow_action}>
      <button
        type="button"
        className={styles.follow_button}
        data-following={isFollowing}
        aria-label={`${actionLabel} ${username}`}
        aria-pressed={isFollowing}
        disabled={isPending}
        onClick={updateRelationship}
      >
        <FontAwesome
          prefix="fad"
          name={isFollowing ? "user-minus" : "user-plus"}
        />
        <span>{isPending ? "Updating…" : actionLabel}</span>
      </button>
      {message && (
        <small className={styles.follow_error} role="alert">
          {message}
        </small>
      )}
    </span>
  );
}
