export const generalizedMean = (x: number[], p: number) => {
	if (x.length === 0)
		throw new Error("x has no numbers");
	
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
		const sum = x.reduce((steps, value) => steps + value ** p / x.length, 0);
		return sum ** (1 / p);
	}
}