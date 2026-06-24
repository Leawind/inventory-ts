/**
 * Get all Git-tracked file paths (relative to repo root) under the given directory.
 */
export async function getGitTrackedFiles(dir: string): Promise<string[]> {
  const command = new Deno.Command('git', {
    args: ['ls-files', '-z'],
    cwd: dir,
    stdout: 'piped',
    stderr: 'piped',
  })

  const { code, stdout, stderr } = await command.output()

  if (code !== 0) {
    const errorText = new TextDecoder().decode(stderr)
    throw new Error(`git ls-files failed in "${dir}": ${errorText}`)
  }

  const output = new TextDecoder().decode(stdout)
  return output.split('\0').filter((f) => f.length > 0).sort()
}
