export function makeTempDirSync(options?: Deno.MakeTempOptions): string {
	return Deno.makeTempDirSync(options);
}

export function makeTempDir(options?: Deno.MakeTempOptions): Promise<string> {
	return Deno.makeTempDir(options);
}

export function makeTempFileSync(options?: Deno.MakeTempOptions): string {
	return Deno.makeTempFileSync(options);
}

export function makeTempFile(options?: Deno.MakeTempOptions): Promise<string> {
	return Deno.makeTempFile(options);
}
