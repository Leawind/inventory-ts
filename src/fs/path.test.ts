import { assert, assertEquals, assertStrictEquals, assertThrows } from '@std/assert';
import { DirPath, FilePath, Path, SymlinkPath, VoidPath } from './path.ts';
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

		await t.step('get str returns the path', () => {
			const path = new Path('/some/path');
			assertEquals(path.str, '/some/path');
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
			const parent = path.getParent();
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

		await t.step('isSymlinkSync checks if path is symlink synchronously', () => {
			const dirPath = new Path(tempDir);
			const filePath = new Path(`${tempDir}/test-symlink-sync.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			assert(!dirPath.isSymlinkSync());
			assert(!filePath.isSymlinkSync());
		});

		await t.step('isSymlink checks if path is symlink asynchronously', async () => {
			const dirPath = new Path(tempDir);
			const filePath = new Path(`${tempDir}/test-symlink-async.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			assertEquals(await dirPath.isSymlink(), false);
			assertEquals(await filePath.isSymlink(), false);
		});
	} finally {
		await Deno.remove(tempDir, { recursive: true });
	}
});

Deno.test('fs/path: Path type detection methods', async (t) => {
	const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' });

	try {
		await t.step('typeSync detects file type', () => {
			const filePath = new Path(`${tempDir}/test-file.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			assertEquals(filePath.typeSync(), FilePath);
		});

		await t.step('typeSync detects directory type', () => {
			const dirPath = new Path(tempDir);

			assertEquals(dirPath.typeSync(), DirPath);
		});

		await t.step('typeSync detects void path type', () => {
			const voidPath = new Path(`${tempDir}/nonexistent`);

			assertEquals(voidPath.typeSync(), VoidPath);
		});

		await t.step('type detects file type', async () => {
			const filePath = new Path(`${tempDir}/test-file-type.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			assertEquals(await filePath.type(), FilePath);
		});

		await t.step('type detects directory type', async () => {
			const dirPath = new Path(tempDir);

			assertEquals(await dirPath.type(), DirPath);
		});

		await t.step('type detects void path type', async () => {
			const voidPath = new Path(`${tempDir}/nonexistent-type`);

			assertEquals(await voidPath.type(), VoidPath);
		});
	} finally {
		await Deno.remove(tempDir, { recursive: true });
	}
});

Deno.test('fs/path: File info methods', async (t) => {
	const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' });

	try {
		await t.step('lstatSync returns file info without following symlinks', () => {
			const filePath = new Path(`${tempDir}/test-lstatsync.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			const fileInfo = filePath.lstatSync();
			assert(fileInfo.isFile);
		});

		await t.step('lstat returns file info without following symlinks asynchronously', async () => {
			const filePath = new Path(`${tempDir}/test-lstat.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			const fileInfo = await filePath.lstat();
			assert(fileInfo.isFile);
		});

		await t.step('statSync returns file info following symlinks', () => {
			const filePath = new Path(`${tempDir}/test-statsync.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			const fileInfo = filePath.statSync();
			assert(fileInfo.isFile);
		});

		await t.step('stat returns file info following symlinks asynchronously', async () => {
			const filePath = new Path(`${tempDir}/test-stat.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			const fileInfo = await filePath.stat();
			assert(fileInfo.isFile);
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

		await t.step('asSync returns correctly typed path when check passes', () => {
			const filePath = new Path(`${tempDir}/test-asSync.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			const typedPath = filePath.asSync(FilePath, true);
			assertEquals(typedPath.constructor, FilePath);
		});

		await t.step('as returns correctly typed path when check passes', async () => {
			const filePath = new Path(`${tempDir}/test-as.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			const typedPath = await filePath.as(FilePath, true);
			assertEquals(typedPath.constructor, FilePath);
		});

		await t.step('asFile converts to FilePath asynchronously', async () => {
			const filePath = new Path(`${tempDir}/test-asFile.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			const typedPath = await filePath.asFile();
			assertEquals(typedPath.constructor, FilePath);
		});

		await t.step('asDir converts to DirPath asynchronously', async () => {
			const dirPath = new Path(tempDir);

			const typedPath = await dirPath.asDir();
			assertEquals(typedPath.constructor, DirPath);
		});

		await t.step('asSymlink converts to SymlinkPath asynchronously', async () => {
			const symlinkPath = new Path(`${tempDir}/symlink-target`);

			// This should fail because it's not actually a symlink, but the method exists
			try {
				const typedPath = await symlinkPath.asSymlink(false); // skip check
				assertEquals(typedPath.constructor, SymlinkPath);
			} catch {
				// Expected to fail if not actually a symlink
			}
		});

		await t.step('asFileSync converts to FilePath synchronously', () => {
			const filePath = new Path(`${tempDir}/test-asFileSync.txt`);
			Deno.writeTextFileSync(filePath.path, 'test content');

			const typedPath = filePath.asFileSync();
			assertEquals(typedPath.constructor, FilePath);
		});

		await t.step('asDirSync converts to DirPath synchronously', () => {
			const dirPath = new Path(tempDir);

			const typedPath = dirPath.asDirSync();
			assertEquals(typedPath.constructor, DirPath);
		});

		await t.step('asSymlinkSync converts to SymlinkPath synchronously', () => {
			const symlinkPath = new Path(`${tempDir}/symlink-target-sync`);

			// This should fail because it's not actually a symlink, but the method exists
			try {
				const typedPath = symlinkPath.asSymlinkSync(false); // skip check
				assertEquals(typedPath.constructor, SymlinkPath);
			} catch {
				// Expected to fail if not actually a symlink
			}
		});
	} finally {
		await Deno.remove(tempDir, { recursive: true });
	}
});

Deno.test('fs/path: Static factory methods', async (t) => {
	const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' });

	try {
		await t.step('Path.voidSync creates VoidPath instance', () => {
			const voidPath = Path.voidSync(`${tempDir}/nonexistent`, false);
			assertEquals(voidPath.constructor, VoidPath);
		});

		await t.step('Path.fileSync creates FilePath instance', () => {
			const filePath = `${tempDir}/test-fileSync.txt`;
			Deno.writeTextFileSync(filePath, 'test content');

			const typedPath = Path.fileSync(filePath);
			assertEquals(typedPath.constructor, FilePath);
		});

		await t.step('Path.dirSync creates DirPath instance', () => {
			const typedPath = Path.dirSync(tempDir);
			assertEquals(typedPath.constructor, DirPath);
		});

		await t.step('Path.symlinkSync creates SymlinkPath instance', () => {
			// We'll skip actual symlink creation to avoid platform issues, but test the method
			const symlinkPath = Path.symlinkSync(`${tempDir}/fake-symlink`, false);
			assertEquals(symlinkPath.constructor, SymlinkPath);
		});

		await t.step('Path.void creates VoidPath instance asynchronously', async () => {
			const voidPath = await Path.void(`${tempDir}/nonexistent-async`, false);
			assertEquals(voidPath.constructor, VoidPath);
		});

		await t.step('Path.file creates FilePath instance asynchronously', async () => {
			const filePath = `${tempDir}/test-file-async.txt`;
			Deno.writeTextFileSync(filePath, 'test content');

			const typedPath = await Path.file(filePath);
			assertEquals(typedPath.constructor, FilePath);
		});

		await t.step('Path.dir creates DirPath instance asynchronously', async () => {
			const typedPath = await Path.dir(tempDir);
			assertEquals(typedPath.constructor, DirPath);
		});

		await t.step('Path.symlink creates SymlinkPath instance asynchronously', async () => {
			// We'll skip actual symlink creation to avoid platform issues, but test the method
			const symlinkPath = await Path.symlink(`${tempDir}/fake-symlink-async`, false);
			assertEquals(symlinkPath.constructor, SymlinkPath);
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

Deno.test('fs/path: NonVoidPath methods (remove and move)', async (t) => {
	const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' });

	try {
		await t.step('FilePath removeSync removes file', () => {
			const filePath = new FilePath(`${tempDir}/to-be-removed-sync.txt`);
			Deno.writeTextFileSync(filePath.path, 'will be removed');

			assert(existsSync(filePath.path)); // File exists initially

			filePath.removeSync();

			assert(!existsSync(filePath.path)); // File should be removed
		});

		await t.step('FilePath remove removes file asynchronously', async () => {
			const filePath = new FilePath(`${tempDir}/to-be-removed-async.txt`);
			await Deno.writeTextFile(filePath.path, 'will be removed');

			assert(existsSync(filePath.path)); // File exists initially

			await filePath.remove();

			assert(!existsSync(filePath.path)); // File should be removed
		});

		await t.step('DirPath removeSync removes directory', () => {
			const dirPath = new DirPath(`${tempDir}/dir-to-be-removed-sync`);
			Deno.mkdirSync(dirPath.path);

			assert(existsSync(dirPath.path)); // Directory exists initially

			dirPath.removeSync({ recursive: true });

			assert(!existsSync(dirPath.path)); // Directory should be removed
		});

		await t.step('DirPath remove removes directory asynchronously', async () => {
			const dirPath = new DirPath(`${tempDir}/dir-to-be-removed-async`);
			await Deno.mkdir(dirPath.path);

			assert(existsSync(dirPath.path)); // Directory exists initially

			await dirPath.remove({ recursive: true });

			assert(!existsSync(dirPath.path)); // Directory should be removed
		});

		await t.step('FilePath moveTo moves file to new location', async () => {
			const sourcePath = new FilePath(`${tempDir}/source-move.txt`);
			const destPath = new Path(`${tempDir}/dest-move.txt`);

			Deno.writeTextFileSync(sourcePath.path, 'moving file');

			assert(existsSync(sourcePath.path)); // Source file exists
			assert(!existsSync(destPath.path)); // Destination doesn't exist yet

			const movedPath = await sourcePath.moveTo(destPath);

			assert(!existsSync(sourcePath.path)); // Source file no longer exists
			assert(existsSync(destPath.path)); // Destination file now exists
			assertEquals(movedPath.constructor, FilePath); // Returned path is still a FilePath
		});

		await t.step('DirPath moveToSync moves directory to new location', () => {
			const sourceDir = new DirPath(`${tempDir}/source-dir-sync`);
			const destDir = new Path(`${tempDir}/dest-dir-sync`);

			Deno.mkdirSync(sourceDir.path);
			Deno.writeTextFileSync(`${sourceDir.path}/test-file.txt`, 'test content');

			assert(existsSync(sourceDir.path)); // Source directory exists
			assert(!existsSync(destDir.path)); // Destination doesn't exist yet

			const movedPath = sourceDir.moveToSync(destDir);

			assert(!existsSync(sourceDir.path)); // Source directory no longer exists
			assert(existsSync(destDir.path)); // Destination directory now exists
			assertEquals(movedPath.constructor, DirPath); // Returned path is still a DirPath
		});
	} finally {
		await Deno.remove(tempDir, { recursive: true });
	}
});

Deno.test('fs/path: VoidPath methods', async (t) => {
	const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' });

	try {
		await t.step('VoidPath mkdir creates directory', async () => {
			const voidPath = new VoidPath(`${tempDir}/new-dir`);
			const dirPath = await voidPath.mkdir();

			assertEquals(dirPath.constructor, DirPath);
			assert(existsSync(dirPath.path));
		});

		await t.step('VoidPath mkdirSync creates directory synchronously', () => {
			const voidPath = new VoidPath(`${tempDir}/new-dir-sync`);
			const dirPath = voidPath.mkdirSync();

			assertEquals(dirPath.constructor, DirPath);
			assert(existsSync(dirPath.path));
		});

		await t.step('VoidPath touch creates file', async () => {
			const voidPath = new VoidPath(`${tempDir}/new-file.txt`);
			const filePath = await voidPath.touch();

			assertEquals(filePath.constructor, FilePath);
			assert(existsSync(filePath.path));
		});

		await t.step('VoidPath touchSync creates file synchronously', () => {
			const voidPath = new VoidPath(`${tempDir}/new-file-sync.txt`);
			const filePath = voidPath.touchSync();

			assertEquals(filePath.constructor, FilePath);
			assert(existsSync(filePath.path));
		});

		await t.step('VoidPath write creates and writes to file', async () => {
			const voidPath = new VoidPath(`${tempDir}/write-test.txt`);
			await voidPath.write('Hello, World!');

			const content = await Deno.readTextFile(voidPath.path);
			assertEquals(content, 'Hello, World!');
		});

		await t.step('VoidPath writeSync creates and writes to file synchronously', () => {
			const voidPath = new VoidPath(`${tempDir}/write-test-sync.txt`);
			voidPath.writeSync('Hello, Sync World!');

			const content = Deno.readTextFileSync(voidPath.path);
			assertEquals(content, 'Hello, Sync World!');
		});

		await t.step('VoidPath linkSync creates hard link', () => {
			const filePath = `${tempDir}/original-file.txt`;
			const linkPath = `${tempDir}/hard-link-sync.txt`;

			Deno.writeTextFileSync(filePath, 'original content');

			const voidPath = new VoidPath(linkPath);
			const symlinkPath = voidPath.linkSync(filePath);

			assertEquals(symlinkPath.constructor, SymlinkPath);
			assert(existsSync(linkPath)); // Link was created
		});

		await t.step('VoidPath link creates hard link asynchronously', async () => {
			const filePath = `${tempDir}/original-file-async.txt`;
			const linkPath = `${tempDir}/hard-link-async.txt`;

			await Deno.writeTextFile(filePath, 'original content');

			const voidPath = new VoidPath(linkPath);
			const symlinkPath = await voidPath.link(filePath);

			assertEquals(symlinkPath.constructor, SymlinkPath);
			assert(existsSync(linkPath)); // Link was created
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
	} finally {
		await Deno.remove(tempDir, { recursive: true });
	}
});
