"use client";

import { useState } from "react";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/auth.module.css";

export default function PasswordField({ name, label, hint, error, autoComplete }: {
	name: "password" | "confirmPassword",
	label: string,
	hint?: string,
	error?: string,
	autoComplete: string
}) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className={styles.field}>
			<div className={styles.label_row}>
				<label htmlFor={name}>{label}</label>
				{hint && <span>{hint}</span>}
			</div>
			<div className={styles.password_field}>
				<input id={name}
				       name={name}
				       type={showPassword ? "text" : "password"}
				       autoComplete={autoComplete}
				       aria-invalid={Boolean(error)}
				       aria-describedby={error ? `${name}-error` : undefined}
				       required/>
				<button type="button"
				        aria-label={showPassword ? "Hide password" : "Show password"}
				        aria-pressed={showPassword}
				        onClick={() => setShowPassword((value) => !value)}>
					<FontAwesome prefix="fas" name={showPassword ? "eye-slash" : "eye"}/>
				</button>
			</div>
			{error && <p id={`${name}-error`} className={styles.field_error}>{error}</p>}
		</div>
	);
}
