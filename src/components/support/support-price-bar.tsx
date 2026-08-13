"use client";

import { type CSSProperties, useId, useState } from "react";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/support.module.css";

const MIN_WEEKS = 4;
const MAX_WEEKS = 48;
const WEEKLY_PRICE = 1.25;
const DISCOUNT_START_PRICE = 10;

type PriceBarLabels = Readonly<{
	title: string,
	description: string,
	total: string,
	weeks: string,
	save: string,
	off: string,
	standard: string,
	input: string,
	rangeError: string
}>;

type PriceBarStyle = CSSProperties & {
	"--price-position": string,
	"--price-progress": string
};

const clampWeeks = (value: number) => Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, value));

const normalizeWeeksInput = (value: string) => {
	return value
		.replace(/[０-９]/g, (digit) => String(digit.charCodeAt(0) - 0xFEE0));
};

const formatPrice = (price: number) => {
	return `$${Number.isInteger(price) ? price.toFixed(0) : price.toFixed(2)}`;
};

export default function SupportPriceBar({ labels }: Readonly<{ labels: PriceBarLabels }>) {
	const inputId = useId();
	const [selectedWeeks, setSelectedWeeks] = useState(MIN_WEEKS);
	const [weeksInput, setWeeksInput] = useState(String(MIN_WEEKS));
	const price = selectedWeeks * WEEKLY_PRICE;
	const discount = price >= DISCOUNT_START_PRICE ? 20 : 0;
	const supporterWeeks = discount > 0 ? Math.floor(selectedWeeks * 1.2) : selectedWeeks;
	const progressRatio = (selectedWeeks - MIN_WEEKS) / (MAX_WEEKS - MIN_WEEKS);
	const progress = progressRatio * 100;
	const thumbCenterOffset = (0.5 - progressRatio) * 19;
	const priceBarStyle: PriceBarStyle = {
		"--price-position": `calc(${progress}% + ${thumbCenterOffset}px)`,
		"--price-progress": `${progress}%`
	};
	const normalizedInput = normalizeWeeksInput(weeksInput);
	const parsedInput = Number(normalizedInput);
	const isInputValid = /^[0-9]+$/.test(normalizedInput) && Number.isInteger(parsedInput) &&
		parsedInput >= MIN_WEEKS && parsedInput <= MAX_WEEKS;

	const updateWeeks = (value: number) => {
		if (!Number.isFinite(value)) return;
		const nextWeeks = clampWeeks(Math.trunc(value));
		setSelectedWeeks(nextWeeks);
		setWeeksInput(String(nextWeeks));
	};

	const updateWeeksInput = (value: string) => {
		const normalizedValue = normalizeWeeksInput(value);
		setWeeksInput(value);
		const parsedValue = Number(normalizedValue);
		if (/^[0-9]+$/.test(normalizedValue) && Number.isInteger(parsedValue) &&
			parsedValue >= MIN_WEEKS && parsedValue <= MAX_WEEKS) {
			setSelectedWeeks(parsedValue);
		}
	};

	const validateWeeksInput = () => {
		if (!/^[0-9]+$/.test(normalizedInput) || !Number.isFinite(parsedInput)) {
			setWeeksInput(String(selectedWeeks));
			return;
		}
		updateWeeks(parsedInput);
	};

	return (
		<div className={styles.price_calculator} style={priceBarStyle} data-page-enter="box">
			<div className={styles.price_calculator_heading}>
				<i><FontAwesome prefix="fad" name="slider"/></i>
				<span>
					<strong>{labels.title}</strong>
					<p>{labels.description}</p>
				</span>
			</div>

			<div className={styles.price_bar}>
				<output className={styles.price_tooltip} htmlFor={inputId} aria-live="polite">
					<strong>{formatPrice(price)}</strong>
					<span>{supporterWeeks} {labels.weeks}</span>
					<small>{discount > 0 ? `${labels.save} ${discount}% ${labels.off}` : labels.standard}</small>
				</output>
				<input id={inputId}
				       className={styles.price_range}
				       type="range"
				       min={MIN_WEEKS}
				       max={MAX_WEEKS}
				       step={1}
				       value={selectedWeeks}
				       aria-label={labels.input}
				       onChange={(event) => updateWeeks(event.currentTarget.valueAsNumber)}/>
				<div className={styles.price_bar_limits} aria-hidden="true">
					<span>{MIN_WEEKS}</span>
					<span>{MAX_WEEKS}</span>
				</div>
			</div>

			<div className={styles.price_input_row} data-invalid={!isInputValid}>
				<label htmlFor={`${inputId}-number`}>{labels.total}</label>
				<span>
					<input id={`${inputId}-number`}
					       type="text"
					       inputMode="numeric"
					       value={weeksInput}
					       aria-label={labels.input}
					       aria-invalid={!isInputValid}
					       aria-describedby={!isInputValid ? `${inputId}-error` : undefined}
					       onChange={(event) => updateWeeksInput(event.currentTarget.value)}
					       onBlur={validateWeeksInput}
					       onFocus={() => setWeeksInput("")}
					       onKeyDown={(event) => {
						       if (event.key === "Enter") event.currentTarget.blur();
					       }}/>
					<small>{labels.weeks}</small>
				</span>
				<strong>{formatPrice(price)}</strong>
				{!isInputValid && <small id={`${inputId}-error`} className={styles.price_input_error} role="alert">{labels.rangeError}</small>}
			</div>
		</div>
	);
}
