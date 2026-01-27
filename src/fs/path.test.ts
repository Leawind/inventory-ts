import { assert, assertEquals, assertStrictEquals, assertThrows } from '@std/assert';
import { DirPath, EmptyPath, FilePath, Path, SymlinkPath } from './path.ts';
import { existsSync } from './basic.ts';
import { p } from './utils.ts';

Deno.test('fs/path: Path basic construction and conversion', async (t) => {
	const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' });

	try {
		await t.step('Path constructor creates instance with given path', () => {
			const path = new Path('/some/path');
			assertStrictEquals(path.path, '/some/path');
		});

		await t.step('Path.from creates new instance from string', () => {
			const path = Path.from('/some/path');
			assertStrictEquals(path.path, '/some/path');
		});

		await t.step('Path.from returns same instance if passed a Path', () => {
			const original = new Path('/some/path');
			const result = Path.from(original);
			assertStrictEquals(result, original);
		});

		await t.step('toString returns the path', () => {
			const path = new Path('/some/path');
			assertEquals(path.toString(), '/some/path');
		});

		await t.step('Symbol.toPrimitive returns the path', () => {
			const path = new Path('/some/path');
			assertEquals(`${path}`, '/some/path');
		});
	} finally {
		await Deno.remove(tempDir, { recursive: true });
	}
});

Deno.test('fs/path: Path properties and methods', async (t) => {
	const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' });

	try {
		await t.step('name property returns basename', () => {
			const path = new Path('/some/path/file.txt');
			assertEquals(path.name, 'file.txt');
		});

		await t.step('dotext property returns extension with dot', () => {
			const path = new Path('/some/path/file.txt');
			assertEquals(path.dotext, '.txt');

			const path2 = new Path('/some/path/.hidden');
			assertEquals(path2.dotext, '.hidden');
		});

		await t.step('ext property returns extension without dot', () => {
			const path = new Path('/some/path/file.txt');
			assertEquals(path.ext, 'txt');

			const path2 = new Path('/some/path/file.tar.gz');
			assertEquals(path2.ext, 'gz');
		});

		await t.step('isAbsolute property identifies absolute paths', () => {
			const absPathUnix = new Path('/some/absolute/path');
			const absPathWin = new Path('C:\\some\\windows\\path');
			const relPath = new Path('./some/relative/path');

			assert(absPathUnix.isAbsolute);
			assert(absPathWin.isAbsolute);
			assert(!relPath.isAbsolute);
		});

		await t.step('isRelative property identifies relative paths', () => {
			const absPathUnix = new Path('/some/absolute/path');
			const relPath = new Path('./some/relative/path');
			const relPath2 = new Path('../another/relative/path');

			assert(!absPathUnix.isRelative);
			assert(relPath.isRelative);
			assert(relPath2.isRelative);
		});

		await t.step('absolute method converts to absolute path', () => {
			const relPath = new Path('./some/relative/path');
			const absPath = relPath.absolute();
			assert(absPath.isAbsolute);
		});

		await t.step('relative method creates relative path from base', () => {
			const basePath = new Path('/base/path');
			const targetPath = new Path('/base/path/target/subpath');
			const relative = targetPath.relative(basePath);
			assertEquals(p`${relative}`, p`target/subpath`);
		});

		await t.step('getparent returns parent directory', () => {
			const path = new Path('/some/path/file.txt');
			const parent = path.getparent();
			assertEquals(p`${parent}`, p`/some/path`);
		});

		await t.step('join combines paths', () => {
			const basePath = new Path('/some/path');
			const joined = basePath.join('sub', 'folder', 'file.txt');
			assertEquals(p`${joined}`, p`/some/path/sub/folder/file.txt`);
		});
	} finally {
		await Deno.remove(tempDir, { recursive: true });
	}
});

Deno.test('fs/path: Path type checking methods', async (t) => {
	const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' });

	try {
		await t.step('existsSync checks if path exists synchronously', () => {
			const existingPath = new Path(tempDir);
			const nonExistingPath = new Path(`${tempDir}/non-existing-file`);

			assert(existingPath.existsSync());
			assert(!nonExistingPath.existsSync());
		});

		await t.step('exists checks if path exists asynchronously', async () => {
			const existingPath = new Path(tempDir);
			const nonExistingPath = new Path(`${tempDir}/non-existing-file`);

			assertEquals(await existingPath.exists(), true);
			assertEquals(await nonExistingPath.exists(), false);
		});

		await t.step('isDirectorySync checks if path is directory synchronously', () => {
			const dirPath = new Path(tempDir);
			const filePath = new Path(`${tempDir}/test-file.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			assert(dirPath.isDirectorySync());
			assert(!filePath.isDirectorySync());
		});

		await t.step('isDirectory checks if path is directory asynchronously', async () => {
			const dirPath = new Path(tempDir);
			const filePath = new Path(`${tempDir}/test-file-async.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			assertEquals(await dirPath.isDirectory(), true);
			assertEquals(await filePath.isDirectory(), false);
		});

		await t.step('isFileSync checks if path is file synchronously', () => {
			const dirPath = new Path(tempDir);
			const filePath = new Path(`${tempDir}/test-file-sync.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			assert(!dirPath.isFileSync());
			assert(filePath.isFileSync());
		});

		await t.step('isFile checks if path is file asynchronously', async () => {
			const dirPath = new Path(tempDir);
			const filePath = new Path(`${tempDir}/test-file-async-2.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			assertEquals(await dirPath.isFile(), false);
			assertEquals(await filePath.isFile(), true);
		});
	} finally {
		await Deno.remove(tempDir, { recursive: true });
	}
});

Deno.test('fs/path: Type conversion methods', async (t) => {
	const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' });

	try {
		await t.step('asSync throws error if path is not expected type', () => {
			const filePath = new Path(`${tempDir}/test.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			// Try to cast a file as a directory - should throw
			assertThrows(
				() => {
					filePath.asSync(DirPath);
				},
				Error,
				`Path ${filePath.path} is not a DirPath`,
			);
		});

		await t.step('as throws error if path is not expected type', async () => {
			const filePath = new Path(`${tempDir}/test2.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			// Using await with assertThrows to properly handle the async function
			let errorOccurred = false;
			try {
				await filePath.as(DirPath);
			} catch (e) {
				errorOccurred = true;
				assert(e instanceof Error);
				assertEquals(e.message, `Path ${filePath.path} is not a DirPath`);
			}
			assert(errorOccurred, 'Expected an error to be thrown');
		});
	} finally {
		await Deno.remove(tempDir, { recursive: true });
	}
});

Deno.test('fs/path: EmptyPath methods', async (t) => {
	const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' });

	try {
		await t.step('EmptyPath mkdir creates directory', async () => {
			const emptyPath = new EmptyPath(`${tempDir}/new-dir`);
			const dirPath = await emptyPath.mkdir();

			assertEquals(dirPath.constructor, DirPath);
			assert(existsSync(dirPath.path));
		});

		await t.step('EmptyPath mkdirSync creates directory synchronously', () => {
			const emptyPath = new EmptyPath(`${tempDir}/new-dir-sync`);
			const dirPath = emptyPath.mkdirSync();

			assertEquals(dirPath.constructor, DirPath);
			assert(existsSync(dirPath.path));
		});

		await t.step('EmptyPath touch creates file', async () => {
			const emptyPath = new EmptyPath(`${tempDir}/new-file.txt`);
			const filePath = await emptyPath.touch();

			assertEquals(filePath.constructor, FilePath);
			assert(existsSync(filePath.path));
		});

		await t.step('EmptyPath touchSync creates file synchronously', () => {
			const emptyPath = new EmptyPath(`${tempDir}/new-file-sync.txt`);
			const filePath = emptyPath.touchSync();

			assertEquals(filePath.constructor, FilePath);
			assert(existsSync(filePath.path));
		});

		await t.step('EmptyPath write creates and writes to file', async () => {
			const emptyPath = new EmptyPath(`${tempDir}/write-test.txt`);
			await emptyPath.write('Hello, World!');

			const content = await Deno.readTextFile(emptyPath.path);
			assertEquals(content, 'Hello, World!');
		});

		await t.step('EmptyPath writeSync creates and writes to file synchronously', () => {
			const emptyPath = new EmptyPath(`${tempDir}/write-test-sync.txt`);
			emptyPath.writeSync('Hello, Sync World!');

			const content = Deno.readTextFileSync(emptyPath.path);
			assertEquals(content, 'Hello, Sync World!');
		});
	} finally {
		await Deno.remove(tempDir, { recursive: true });
	}
});

Deno.test('fs/path: FilePath methods', async (t) => {
	const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' });

	try {
		await t.step('FilePath readSync reads file content as bytes', () => {
			const filePath = `${tempDir}/read-test.txt`;
			const testData = 'Hello, Read Test!';
			Deno.writeTextFileSync(filePath, testData);

			const fileObj = new FilePath(filePath);
			const bytes = fileObj.readSync();
			const content = new TextDecoder().decode(bytes);

			assertEquals(content, testData);
		});

		await t.step('FilePath read reads file content as bytes asynchronously', async () => {
			const filePath = `${tempDir}/read-test-async.txt`;
			const testData = 'Hello, Async Read Test!';
			await Deno.writeTextFile(filePath, testData);

			const fileObj = new FilePath(filePath);
			const bytes = await fileObj.read();
			const content = new TextDecoder().decode(bytes);

			assertEquals(content, testData);
		});

		await t.step('FilePath readTextSync reads file content as string', () => {
			const filePath = `${tempDir}/read-text-test.txt`;
			const testData = 'Hello, Read Text Test!';
			Deno.writeTextFileSync(filePath, testData);

			const fileObj = new FilePath(filePath);
			const content = fileObj.readTextSync();

			assertEquals(content, testData);
		});

		await t.step('FilePath readText reads file content as string asynchronously', async () => {
			const filePath = `${tempDir}/read-text-test-async.txt`;
			const testData = 'Hello, Async Read Text Test!';
			await Deno.writeTextFile(filePath, testData);

			const fileObj = new FilePath(filePath);
			const content = await fileObj.readText();

			assertEquals(content, testData);
		});

		await t.step('FilePath writeSync updates file content', () => {
			const filePath = `${tempDir}/write-update-test.txt`;
			const initialData = 'Initial content';
			Deno.writeTextFileSync(filePath, initialData);

			const fileObj = new FilePath(filePath);
			fileObj.writeSync('Updated content');

			const content = Deno.readTextFileSync(filePath);
			assertEquals(content, 'Updated content');
		});

		await t.step('FilePath write updates file content asynchronously', async () => {
			const filePath = `${tempDir}/write-update-test-async.txt`;
			const initialData = 'Initial content';
			await Deno.writeTextFile(filePath, initialData);

			const fileObj = new FilePath(filePath);
			await fileObj.write('Updated content async');

			const content = await Deno.readTextFile(filePath);
			assertEquals(content, 'Updated content async');
		});
	} finally {
		await Deno.remove(tempDir, { recursive: true });
	}
});

Deno.test('fs/path: DirPath methods', async (t) => {
	const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' });

	try {
		await t.step('DirPath listSync returns directory entries', () => {
			// Create some test files
			Deno.writeTextFileSync(`${tempDir}/file1.txt`, 'content1');
			Deno.writeTextFileSync(`${tempDir}/file2.txt`, 'content2');
			Deno.mkdirSync(`${tempDir}/subdir`);

			const dirObj = new DirPath(tempDir);
			const entries = dirObj.listSync();

			assertEquals(entries.length, 3); // file1.txt, file2.txt, subdir

			const entryNames = entries.map((entry) => entry.name).sort();
			assertEquals(entryNames, ['file1.txt', 'file2.txt', 'subdir'].sort());
		});

		await t.step('DirPath list returns directory entries asynchronously', async () => {
			// Create a subdirectory for this test
			const testSubDir = `${tempDir}/async-list-test`;
			Deno.mkdirSync(testSubDir);

			// Create some test files in the subdirectory
			Deno.writeTextFileSync(`${testSubDir}/async-file1.txt`, 'content1');
			Deno.writeTextFileSync(`${testSubDir}/async-file2.txt`, 'content2');
			Deno.mkdirSync(`${testSubDir}/async-subdir`);

			const dirObj = new DirPath(testSubDir);
			const entries = await dirObj.list();

			assertEquals(entries.length, 3); // async-file1.txt, async-file2.txt, async-subdir

			const entryNames = entries.map((entry) => entry.name).sort();
			assertEquals(entryNames, ['async-file1.txt', 'async-file2.txt', 'async-subdir'].sort());
		});
	} finally {
		await Deno.remove(tempDir, { recursive: true });
	}
});

Deno.test('fs/path: SymlinkPath methods', async (t) => {
	const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' });

	try {
		await t.step('SymlinkPath targetSync returns link target', () => {
			const targetPath = `${tempDir}/target.txt`;
			const linkPath = `${tempDir}/link.txt`;

			Deno.writeTextFileSync(targetPath, 'target content');
			Deno.symlinkSync(targetPath, linkPath);

			const symlinkObj = new SymlinkPath(linkPath);
			const target = symlinkObj.targetSync();

			assertEquals(p`${target.path}`, p`${targetPath}`);
		});

		await t.step('SymlinkPath target returns link target asynchronously', async () => {
			const targetPath = `${tempDir}/target-async.txt`;
			const linkPath = `${tempDir}/link-async.txt`;

			Deno.writeTextFileSync(targetPath, 'target content');
			await Deno.symlink(targetPath, linkPath);

			const symlinkObj = new SymlinkPath(linkPath);
			const target = await symlinkObj.target();

			assertEquals(p`${target.path}`, p`${targetPath}`);
		});
	} catch (error) {
		// Skip symlink tests on Windows if not running with elevated privileges
		if (!(error instanceof Deno.errors.PermissionDenied && Deno.build.os === 'windows')) {
			throw error;
		}
	} finally {
		await Deno.remove(tempDir, { recursive: true });
	}
});

Deno.test('fs/path: Static helper methods', async (t) => {
	const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' });

	try {
		await t.step('Path.cwd returns current working directory as Path', () => {
			const cwd = Path.cwd();
			assert(cwd.isAbsolute);
		});

		await t.step('Path.str returns string representation of PathLike', () => {
			const pathStr = '/some/test/path';
			const pathObj = new Path(pathStr);

			assertEquals(Path.str(pathStr), pathStr);
			assertEquals(Path.str(pathObj), pathStr);
		});
	} finally {
		await Deno.remove(tempDir, { recursive: true });
	}
});
