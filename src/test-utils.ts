export function wait(ms: number): Promise<void> {
	if (ms < 0) {
		ms = 0;
	}
	if (ms == 0) {
		return Promise.resolve();
	} else {
		return new Promise<void>((resolve) => setTimeout(resolve, ms));
	}
}

export class TimeRuler {
	private startTime!: number;

	constructor(offset: number = 0) {
		this.start(offset);
	}
	public start(offset: number = 0): this {
		this.startTime = Date.now() + offset;
		return this;
	}
	public now(): number {
		return Date.now() - this.startTime;
	}
	public async til(time: number): Promise<void> {
		const timeLeft = time - this.now();
		if (timeLeft <= 1) {
			return;
		}
		await this.wait(timeLeft);
	}
	public wait(ms: number): Promise<void> {
		if (ms < 0) {
			ms = 0;
		}
		if (ms == 0) {
			return Promise.resolve();
		} else {
			return new Promise<void>((resolve) => setTimeout(resolve, ms));
		}
	}
}
