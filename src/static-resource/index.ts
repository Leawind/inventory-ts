// deno-lint-ignore-file no-explicit-any
import * as std_path from '@std/path@1';

/**
 * A class for managing static resources.
 * It provides methods to fetch various types of static files (e.g., text, JSON, binary data) based on the specified type.
 */
export class StaticResourceManager {
	constructor(
		/**
		 * The base directory path where static resources are located.
		 */
		private readonly base: string,
		/**
		 * Refer to [Window: fetch() method - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#options)
		 */
		public fetchOptions?: RequestInit,
	) {}

	/**
	 * Fetches a static resource and returns it in the specified format.
	 * If no type is provided, the method infers the type based on the file extension:
	 * - `.json` files are treated as JSON.
	 * - Other files are treated as plain text.
	 *
	 * @param specifier - The relative path or filename of the resource to fetch.
	 * @param type - The desired type of the fetched resource. Supported types include:
	 *   - `text`: Returns the content as a string.
	 *   - `json`: Parses and returns the content as a JSON object.
	 *   - `bytes`: Returns the content as a Uint8Array.
	 *   - `blob`: Returns the content as a Blob.
	 *   - `arrayBuffer`: Returns the content as an ArrayBuffer.
	 *   - `body`: Returns the readable stream body of the response.
	 *   - `formData`: Returns the content as a FormData object.
	 * @returns A promise that resolves to the fetched resource in the specified format.
	 * @throws An error if an unknown type is provided.
	 */
	public async fetch(specifier: `${string}.json`): Promise<any>;
	public async fetch(specifier: string): Promise<string>;
	public async fetch(specifier: string, type: 'text'): Promise<string>;
	public async fetch(specifier: string, type: 'json'): Promise<any>;
	public async fetch(specifier: string, type: 'bytes'): Promise<Uint8Array>;
	public async fetch(specifier: string, type: 'blob'): Promise<Blob>;
	public async fetch(specifier: string, type: 'arrayBuffer'): Promise<ArrayBuffer>;
	public async fetch(specifier: string, type: 'body'): Promise<ReadableStream<Uint8Array> | null>;
	public async fetch(specifier: string, type: 'formData'): Promise<FormData>;
	public async fetch(specifier: string, type?: string): Promise<any> {
		const uri = import.meta.resolve(std_path.join(this.base, specifier));
		const result = await fetch(uri, this.fetchOptions);
		if (!type) {
			if (specifier.endsWith('.json')) {
				type = 'json';
			} else {
				type = 'text';
			}
		}

		switch (type) {
			case 'text':
				return result.text();
			case 'json':
				return result.json();
			case 'bytes':
				return result.bytes();
			case 'blob':
				return result.blob();
			case 'arrayBuffer':
				return result.arrayBuffer();
			case 'body':
				return result.body;
			case 'formData':
				return result.formData();
			default:
				throw new Error(`Unknown type: ${type}`);
		}
	}
}
