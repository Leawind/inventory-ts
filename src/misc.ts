/**
 * @param dirPath start at this path
 * @param filter skip if return true
 */
export function walkSync(
	dirPath: string,
	callback: (dir: string, files: string[], dirs: string[]) => boolean | void,
	filter: (filePath: string) => boolean = (_) => true,
	maxDepth: number = Infinity,
): void {
	if (maxDepth == 0) return;
	if (!Deno.statSync(dirPath).isDirectory) return;
	const sublist = Deno.readDirSync(dirPath).map((entry) => entry.name);
	const subFileNames: string[] = [];
	const subDirNames: string[] = [];
	const subDirPaths: string[] = [];
	for (const subname of sublist) {
		const subpath = `${dirPath}/${subname}`;
		const substat = Deno.statSync(subpath);
		if (substat.isFile) {
			subFileNames.push(subname);
		} else if (substat.isDirectory) {
			subDirPaths.push(subpath);
			subDirNames.push(subname);
		}
	}
	callback(dirPath, subFileNames, subDirNames);
	for (const subDirPath of subDirPaths) {
		if (filter(subDirPath)) {
			walkSync(subDirPath, callback, filter, maxDepth - 1);
		}
	}
}

export function walkInTreeSync<T>(
	node: T,
	sublistFn: (nodePath: T[]) => Iterable<T>,
	isLeaveFn: (nodePath: T[]) => boolean,
	onnodeFn: (nodePath: T[], isleave: boolean, brothers: T[][]) => void,
	supnodes: T[] = [],
	brothers: T[][] = [[]],
): void {
	const nodePath = supnodes.concat([node]);
	const isLeave = isLeaveFn(nodePath);
	onnodeFn(nodePath, isLeave, brothers);
	if (!isLeave) {
		const subnodes: Iterable<T> = sublistFn(nodePath);
		const myBros = brothers.concat([[...subnodes]]);
		for (const subnode of subnodes) {
			walkInTreeSync(subnode, sublistFn, isLeaveFn, onnodeFn, nodePath, myBros);
		}
	}
}

export function printPathTreeSync(dir: string): string {
	let result = '';
	walkInTreeSync<string>(
		dir,
		(nodePath) => Deno.readDirSync(nodePath.join('/')).map((entry) => entry.name),
		(nodePath) => Deno.statSync(nodePath.join('/')).isFile,
		(nodePath, isleave, brothers) => {
			const me: string = nodePath.at(-1)!;
			const myBros = brothers.at(-1) || [me];
			const index: number = myBros.indexOf(me);
			let prefix = '';
			for (let i = 1; i < brothers.length - 1; i++) {
				const node = nodePath[i];
				const bros = brothers[i];
				const j = bros.indexOf(node);
				prefix += j === bros.length - 1 ? '    ' : j >= 0 ? '│   ' : '\x1b[33mERR!\x1b[0m';
			}
			prefix += nodePath.length === 1 ? '' : index === myBros.length - 1 ? '└─' : '├─';
			const suffix: string = isleave ? '' : '/';

			// console.log(`${prefix}${me}${suffix}`);
			result += `${prefix}${me}${suffix}`;
		},
	);
	return result;
}

export class Sets {
	static and<T>(setA: Set<T>, setB: Set<T>): Set<T> {
		const s: Set<T> = new Set();
		setA.forEach((a) => setB.has(a) && s.add(a));
		return s;
	}

	static add<A, B>(setA: Set<A>, setB: Set<B>): Set<A | B> {
		const s: Set<A | B> = new Set(setA);
		setB.forEach((b) => s.add(b));
		return s;
	}

	static minus<T>(setA: Set<T>, setB: Set<T>): Set<T> {
		const s: Set<T> = new Set(setA);
		setB.forEach((b) => s.delete(b));
		return s;
	}
}
