export const sum = (x: number[]) => {
	return x.reduce((steps, value) => steps + value, 0);
}

export const generalizedMean = (x: number[], p: number) => {
	if (x.length === 0)
		throw new Error("x has no numbers");
	else if (x.some((value) => value < 0))
		throw new Error(`x has some negative numbers\n${x}`);
	
	if (p === Infinity) {
		return Math.max(...x);
	}
	else if (p === -Infinity) {
		return Math.min(...x);
	}
	else if (p === 0) {
		const pow = x.reduce((steps, value) => steps * value, 1);
		return pow ** (1 / x.length);
	}
	else {
		const max = Math.max(...x);
		const sum = x.reduce((steps, value) => steps + (value / max) ** p / x.length, 0);
		return sum ** (1 / p) * max;
	}
}