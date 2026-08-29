"use client";

import { useState, useTransition, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import FontAwesome from "@/components/font-awesome";
import { readMutationResponse } from "@/lib/mutation-response";
import styles from "@s/settings.module.css";

type PrivacyScope = "personal" | "clan";

export default function PrivacySettingsForm({
  scope,
  isPrivate: initialIsPrivate,
}: Readonly<{
  scope: PrivacyScope;
  isPrivate: boolean;
}>) {
  const router = useRouter();
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [savedIsPrivate, setSavedIsPrivate] = useState(initialIsPrivate);
  const [status, setStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasChanges = isPrivate !== savedIsPrivate;
  const isClan = scope === "clan";

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    startTransition(async () => {
      try {
        const endpoint = `/api/settings/privacy${isClan ? "?scope=clan" : ""}`;
        const response = await fetch(endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPrivate }),
        });
        const result = await readMutationResponse(response);
        setStatus(result);
        if (!result.success) return;

        setSavedIsPrivate(isPrivate);
        router.refresh();
      } catch {
        setStatus({
          success: false,
          message: `${isClan ? "Clan" : "Profile"} privacy could not be updated.`,
        });
      }
    });
  };

  return (
    <form className={styles.profile_form} onSubmit={submit}>
      <label className={styles.toggle_row}>
        <span className={styles.toggle_copy}>
          <span className={styles.toggle_icon}>
            <FontAwesome prefix="fad" name="lock" />
          </span>
          <span>
            <strong>
              {isClan ? "Private clan profile" : "Private profile"}
            </strong>
            <small>
              {isClan
                ? "Only the clan owner and moderators can view the clan profile when this is enabled."
                : "Only you and moderators can view your profile when this is enabled."}
            </small>
          </span>
        </span>
        <input
          type="checkbox"
          checked={isPrivate}
          disabled={isPending}
          onChange={(event) => {
            setIsPrivate(event.target.checked);
            setStatus(null);
          }}
        />
        <span className={styles.toggle} aria-hidden="true">
          <span />
        </span>
      </label>

      <div className={styles.form_footer}>
        <span
          className={styles.status}
          data-success={status?.success}
          role="status"
        >
          {status?.message}
        </span>
        <div className={styles.form_actions}>
          <button
            type="button"
            className={styles.danger_button}
            disabled={isPending || !hasChanges}
            onClick={() => {
              setIsPrivate(savedIsPrivate);
              setStatus(null);
            }}
          >
            <FontAwesome prefix="fas" name="rotate-left" />
            Reset
          </button>
          <button
            type="submit"
            className={styles.primary_button}
            disabled={isPending || !hasChanges}
          >
            <FontAwesome
              className={isPending ? styles.spinner : undefined}
              prefix="fas"
              name={isPending ? "spinner" : "check"}
            />
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
