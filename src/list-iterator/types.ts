export interface ListIterator<E> {
	hasNext(): boolean;
	next(): E;
	hasPrevious(): boolean;
	previous(): E;
	nextIndex(): number;
	previousIndex(): number;

	remove(): void;
	set(e: E): void;
	add(e: E): void;
}
