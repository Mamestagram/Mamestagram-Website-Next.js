"use client";

import { useId, useState } from "react";
import styles from "@s/settings.module.css";

export default function ProfileUiNumberField({
	label,
	value,
	min,
	max,
	step = 1,
	logarithmic = false,
	disabled,
	auto = false,
	autoValue,
	getAutoValue,
	onChange,
}: Readonly<{
	label: string;
	value: number;
	min: number;
	max: number;
	step?: number;
	logarithmic?: boolean;
	disabled: boolean;
	auto?: boolean;
	autoValue?: number;
	getAutoValue?: () => number | undefined;
	onChange: (value: number) => void;
}>) {
	const id = useId();
	const [lastFixedValue, setLastFixedValue] = useState(value === -1 ? Math.min(max, Math.max(min, 500)) : value);
	const [draft, setDraft] = useState<{ value: number; text: string } | null>(null);
	const isAuto = auto && value === -1;
	const fixedValue = isAuto ? autoValue ?? lastFixedValue : value;
	const controlsDisabled = disabled || isAuto;
	const sliderValue = logarithmic
		? Math.log(Math.max(min, fixedValue) / min) / Math.log(max / min) * 1000
		: fixedValue;
	const normalize = (nextValue: number) => {
		const bounded = Math.min(max, Math.max(min, nextValue));
		return Number(Math.min(max, Math.max(min, min + Math.round((bounded - min) / step) * step)).toFixed(10));
	};
	const commit = (nextValue: number) => {
		const normalized = normalize(nextValue);
		setDraft(null);
		onChange(normalized);
	};

	return (
		<div className={styles.profile_ui_number_field}>
			<div className={styles.profile_ui_number_heading}>
				<label htmlFor={id}>{label}</label>
				{auto && <label className={styles.profile_ui_auto_field}>
					<input type="checkbox" checked={isAuto} disabled={disabled} aria-label={`${label} auto`} onChange={(event) => {
						setDraft(null);
						if (event.currentTarget.checked) {
							setLastFixedValue(value);
							onChange(-1);
						} else {
							const autoValue = getAutoValue?.();
							onChange(normalize(autoValue !== undefined && Number.isFinite(autoValue) ? autoValue : lastFixedValue));
						}
					}}/>
					Auto
				</label>}
			</div>
			<input id={id} type="number" min={min} max={max} step={step} value={draft?.value === fixedValue ? draft.text : fixedValue} disabled={controlsDisabled} onChange={(event) => {
				const text = event.currentTarget.value;
				const nextValue = event.currentTarget.valueAsNumber;
				if (Number.isFinite(nextValue) && nextValue >= min && nextValue <= max) {
					const normalized = normalize(nextValue);
					setDraft({ value: normalized, text });
					onChange(normalized);
				} else {
					setDraft({ value: fixedValue, text });
				}
			}} onBlur={(event) => {
				const nextValue = event.currentTarget.valueAsNumber;
				if (Number.isFinite(nextValue)) commit(nextValue);
				else setDraft(null);
			}}/>
			<input type="range" min={logarithmic ? 0 : min} max={logarithmic ? 1000 : max} step={logarithmic ? 1 : step} value={sliderValue} disabled={controlsDisabled} aria-label={`${label} slider`} aria-valuetext={String(fixedValue)} onChange={(event) => {
				const nextValue = event.currentTarget.valueAsNumber;
				commit(logarithmic ? min * Math.pow(max / min, nextValue / 1000) : nextValue);
			}}/>
		</div>
	);
}
