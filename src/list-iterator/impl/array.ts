import type { ListIterator } from '@/list-iterator/types.ts';

export class ArrayListIterator<E> implements ListIterator<E> {
	constructor(private list: E[], private index: number = 0) {}
	hasNext(): boolean {
		return this.index < this.list.length;
	}
	next(): E {
		if (!this.hasNext()) {
			throw new Error('No such element');
		}
		return this.list[this.index++];
	}
	hasPrevious(): boolean {
		return this.index > 0;
	}
	previous(): E {
		if (!this.hasPrevious()) {
			throw new Error('No such element');
		}
		return this.list[--this.index];
	}
	nextIndex(): number {
		return this.index;
	}
	previousIndex(): number {
		return this.index - 1;
	}
	remove(): void {
		if (this.index <= 0 || this.index > this.list.length) {
			throw new Error('Illegal state');
		}
		this.list.splice(this.index - 1, 1);
		this.index--;
	}
	set(e: E): void {
		if (this.index <= 0 || this.index > this.list.length) {
			throw new Error('Illegal state');
		}
		this.list[this.index - 1] = e;
	}
	add(e: E): void {
		this.list.splice(this.index, 0, e);
		this.index++;
	}
}
