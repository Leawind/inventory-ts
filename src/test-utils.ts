export function wait(ms: number): Promise<void> {
	if (ms < 0) {
		ms = 0;
	}
	if (ms == 0) {
		return new Promise<void>((resolve) => resolve());
	} else {
		return new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)));
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
		await this.wait(time - this.now());
	}
	public wait(ms: number): Promise<void> {
		if (ms < 0) {
			ms = 0;
		}
		if (ms == 0) {
			return new Promise<void>((resolve) => resolve());
		} else {
			return new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)));
		}
	}
}
