export const generalizedMean = (x: number[], p: number) => {
	if (x.length === 0)
		throw new Error("x has no numbers");
	if (p === 0)
		throw new Error("p is invalid number");
	
	if (p === Infinity) {
		return Math.max(...x);
	}
	else if (p === -Infinity) {
		return Math.min(...x);
	}
	else {
		const powSum = x.reduce((sum, value) => sum + value ** p / x.length, 0);
		return powSum ** (1 / p);
	}
}