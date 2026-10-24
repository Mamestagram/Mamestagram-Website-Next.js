export const ROLLING_NUMBER_DURATION = 2000;
const MAX_VISIBLE_VALUES = Math.floor(ROLLING_NUMBER_DURATION / (1000 / 30) / 2);

// Keep long transitions bounded, with faster reels toward the units place.
export const createRollingDigits = (from: number, to: number) => {
	const places = String(Math.max(from, to)).length;
	let fastReels = 0;
	return Array.from({ length: places }, (_, index) => {
		const place = places - index - 1;
		const divisor = 10 ** place;
		const start = Math.floor(from / divisor);
		const end = Math.floor(to / divisor);
		const distance = Math.abs(end - start);
		const budget = distance > MAX_VISIBLE_VALUES
			? MAX_VISIBLE_VALUES * (1 + fastReels++ * 0.5) : distance;
		const steps = Math.ceil(budget);
		const frames = Array.from({ length: steps + 1 }, (_, frame) =>
			Math.round(budget === 0 ? end : start + (end - start) * Math.min(1, frame / budget)) % 10);
		if (to < from) frames.reverse();
		return { place, frames };
	});
};
