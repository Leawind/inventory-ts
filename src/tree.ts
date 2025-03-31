export interface ITree {
	get size(): number;
	get root(): ITreeNode;
	get nodes(): Set<ITreeNode>;
	get leaves(): Set<ITreeNode>;
}

export interface ITreeNode {
	get size(): number;
	get children(): Set<ITreeNode>;
	get isRoot(): boolean;
	get parent(): ITreeNode | null;
	/**
	 * No self
	 */
	get brothers(): Set<ITreeNode>;
	get brothersAndSelf(): Set<ITreeNode>;
	attach(parent: ITreeNode, modifyParent: boolean): this;
	detach(modifyParent: boolean): this;
	clearChildren(): this;
	hasChild(node: ITreeNode): boolean;
	addChild(node: ITreeNode, modifyChild: boolean): this;
	removeChild(node: ITreeNode, modifyChild: boolean): this;
}

export class Tree<T> implements ITree {
	root: ITreeNode;
	constructor(root: ITreeNode) {
		this.root = root;
	}
	get nodes(): Set<ITreeNode> {
		throw new Error('Method not implemented.');
	}
	get leaves(): Set<ITreeNode> {
		throw new Error('Method not implemented.');
	}
	get size(): number {
		throw new Error('Method not implemented.');
	}
}

export default class TreeNode<T> implements ITreeNode {
	private _parent: TreeNode<T> | null = null;
	public value: T;
	private _children: Set<TreeNode<T>> = new Set();
	constructor(value: T) {
		this.value = value;
	}
	attach(parent: TreeNode<T>, modifyParent: boolean = true): this {
		modifyParent && parent.addChild(this, false);
		this._parent = parent;
		return this;
	}
	detach(modifyParent: boolean = true): this {
		modifyParent && this._parent?._children.delete(this);
		this._parent = null;
		return this;
	}

	get size(): number {
		return this._children.size;
	}
	get children(): Set<ITreeNode> {
		return new Set(this._children);
	}
	get isRoot(): boolean {
		return this._parent === null;
	}
	get parent(): ITreeNode | null {
		return this._parent;
	}
	get brothers(): Set<ITreeNode> {
		if (this.isRoot) {
			return new Set();
		} else {
			const result = this._parent!.children;
			result.delete(this);
			return result;
		}
	}
	get brothersAndSelf(): Set<ITreeNode> {
		return this._parent?.children || new Set();
	}

	clearChildren(): this {
		this._children.forEach((n) => n.detach(false));
		this._children.clear();
		return this;
	}
	hasChild(node: TreeNode<T>): boolean {
		return this._children.has(node);
	}
	addChild(node: TreeNode<T>, modifyChild: boolean = true): this {
		modifyChild && node.attach(this, false);
		this._children.add(node);
		return this;
	}
	removeChild(node: TreeNode<T>, modifyChild: boolean = true): this {
		modifyChild && node.detach(false);
		this._children.delete(node);
		return this;
	}
}
