export function openURI(uri: string): Deno.Command {
  let cmd: string
  let args: string[]

  switch (Deno.build.os) {
    case 'windows':
      cmd = 'powershell'
      args = ['-NoProfile', '-Command', `Start-Process "${uri}"`]
      break
    case 'darwin':
      cmd = 'open'
      args = [uri]
      break
    case 'linux':
      cmd = 'xdg-open'
      args = [uri]
      break
    default:
      throw new Error('Unsupported OS')
  }

  return new Deno.Command(cmd, { args })
}
