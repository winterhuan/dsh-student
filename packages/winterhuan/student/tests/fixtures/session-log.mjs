/** Read every durable batch in a DSH concatenated-frame Zstandard session log. */
import { readFile } from 'node:fs/promises'
import { zstdDecompressSync } from 'node:zlib'

export async function readSessionLog(path) {
  let remaining = await readFile(path)
  const chunks = []
  while (remaining.length) {
    const { buffer, engine } = zstdDecompressSync(remaining, { info: true })
    chunks.push(buffer)
    remaining = remaining.subarray(engine.bytesWritten)
  }
  return Buffer.concat(chunks).toString()
}
