export type RowId = number;
export type ColumnId = number | string;

export type ColumnType<T = string> = (literal: string) => T;

export type CSVRow = {
	at<T>(col: ColumnId): T;
};

export class CSV {
	public delimiter: string = ',';

	private columnNames: string[] = [];
	private colTypes: (ColumnType<unknown>)[] = [];
	private columns: number = 0;

	private readonly rawData: string[][] = [];

	public rows(): number {
		return this.rawData.length;
	}
	public cols(): number {
		return this.columns;
	}

	private getColIdNum(colId: ColumnId): number | undefined {
		if (typeof colId === 'number') {
			return colId;
		}
		const col = this.columnNames.indexOf(colId);
		return col >= 0 ? col : undefined;
	}

	private parseColValue<T>(colId: ColumnId, raw: string): T | undefined {
		const col = this.getColIdNum(colId);
		if (col === undefined) {
			return undefined;
		}
		if (typeof this.colTypes[col] === 'function') {
			return this.colTypes[col](raw) as T;
		}
		return raw as T;
	}

	public getRaw(row: RowId, colId: ColumnId): string {
		const col: number = this.getColIdNum(colId)!;
		return this.rawData[row][col];
	}

	public get<T = unknown>(row: RowId, colId: ColumnId): T | undefined {
		const raw = this.getRaw(row, colId);
		return this.parseColValue<T>(colId, raw);
	}

	public validateRowId(row: RowId): number {
		if (row < 0 || this.rows() <= row) {
			throw new Error(`Row index out of range: ${row} out of [0, ${this.rows})`);
		}
		return row;
	}

	public validateColId(colId: ColumnId, allowExtend: boolean = false): number {
		if (typeof colId === 'number') {
			if (colId < 0 || (!allowExtend && this.cols() <= colId)) {
				throw new Error(`Column index out of range: ${colId}`);
			}
			return colId;
		} else {
			const col = this.columnNames.indexOf(colId);
			if (col === -1) {
				if (allowExtend) {
					return this.cols();
				} else {
					throw new Error(`Column index out of range: ${colId}`);
				}
			}
			return col;
		}
	}

	public getRawRow(row: number): string[] {
		this.validateRowId(row);
		const rawRow = [];
		for (let col = 0; col < this.cols(); col++) {
			const raw = this.getRaw(row, col);
			rawRow.push(raw);
		}
		return rawRow;
	}

	// public *iterRows() :Iterable<CSVRow> {
	// 	const rows = [];
	// 	for (let rowId = 0; rowId < this.rows; rowId++) {
	// 		rows.push(this.getRawRow(rowId));
	// 	}
	// 	return rows;
	// }

	public setColName(colId: ColumnId, name: string): void {
		if (/^\d*$/.test(name)) {
			throw new Error(`Invalid name: ${name}`);
		}
		const col = this.validateColId(colId, true);
		this.columnNames[col] = name;
		this.columns = Math.max(this.columns, col + 1);
	}

	public setColType(colId: ColumnId, headerType: ColumnType): void {
		this.validateColId(colId);
		const col = this.validateColId(colId, true);
		this.colTypes[col] = headerType;
		this.columns = Math.max(this.columns, col + 1);
	}

	public toString(): string {
		return CSV.stringify(this);
	}

	/**
	 * @param {string} text
	 * @returns {CSV}
	 */
	public static parse(text: string, hasHeader = true, delimiter = ','): CSV {
		const csv = new CSV();
		csv.delimiter = delimiter;
		const rawLines = text.replace(/(\r\n)|\r/g, '\n').split('\n');
		if (hasHeader) {
			const firstLine = rawLines.shift();
			if (firstLine) {
				csv.columnNames = firstLine.split(delimiter).map((col) => col.trim());
			}
			csv.columns = Math.max(csv.columns, csv.columnNames.length);

			for (let rawLine of rawLines) {
				rawLine = rawLine.trim();
				if (rawLine) {
					const rowData = rawLine.split(delimiter).map((raw) => raw.trim());
					csv.rawData.push(rowData);
					csv.columns = Math.max(csv.columns, rowData.length);
				}
			}
		}
		return csv;
	}

	/**
	 * @param {CSV} csv
	 * @returns {string}
	 */
	public static stringify(csv: CSV): string {
		let result = csv.columnNames.join(csv.delimiter) + '\n';
		for (const row of csv.rawData) {
			result += row.join(csv.delimiter) + '\n';
		}
		return result;
	}
}
