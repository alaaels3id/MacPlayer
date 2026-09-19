import * as fs from 'fs'
import path from 'path'
import { SubtitleTrack } from '../../shared/types/subtitle'
import { detectLanguageFromFilename, getLanguageName } from '../../shared/utils/languageCodes'

const SUBTITLE_EXTENSIONS = ['.srt', '.vtt', '.ass', '.ssa']

export async function findAdjacentSubtitles(videoFilePath: string): Promise<SubtitleTrack[]> {
  try {
    const dir = path.dirname(videoFilePath)
    const videoExt = path.extname(videoFilePath)
    const videoBase = path.basename(videoFilePath, videoExt)

    const files = await fs.promises.readdir(dir)
    const tracks: SubtitleTrack[] = []

    for (const file of files) {
      const ext = path.extname(file).toLowerCase()
      if (!SUBTITLE_EXTENSIONS.includes(ext)) continue

      const fileWithoutExt = path.basename(file, ext)

      // Check if subtitle file starts with or matches videoBase
      if (fileWithoutExt.toLowerCase().startsWith(videoBase.toLowerCase())) {
        const fullPath = path.join(dir, file)
        const langCode = detectLanguageFromFilename(file) || 'und'
        const langName = getLanguageName(langCode)

        tracks.push({
          id: `local-${Buffer.from(fullPath).toString('base64').substring(0, 12)}`,
          title: `${file} (${langName})`,
          language: langName,
          languageCode: langCode,
          source: 'adjacent',
          filePath: fullPath,
          delay: 0
        })
      }
    }

    return tracks
  } catch (err) {
    console.error('Error searching adjacent subtitles:', err)
    return []
  }
}

/**
 * Decodes subtitle buffer supporting UTF-8, Windows-1256 (Arabic), UTF-16, and ISO-8859-6
 */
export function decodeSubtitleBuffer(buf: Buffer): string {
  // Check UTF-8 BOM
  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    return new TextDecoder('utf-8').decode(buf.subarray(3))
  }
  // Check UTF-16LE BOM
  if (buf[0] === 0xFF && buf[1] === 0xFE) {
    return new TextDecoder('utf-16le').decode(buf.subarray(2))
  }
  // Check UTF-16BE BOM
  if (buf[0] === 0xFE && buf[1] === 0xFF) {
    return new TextDecoder('utf-16be').decode(buf.subarray(2))
  }

  // Attempt strict UTF-8 decoding
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true })
    const decoded = utf8Decoder.decode(buf)
    // Check for mojibake or suspicious replacement chars
    if (!decoded.includes('\uFFFD')) {
      return decoded
    }
  } catch {
    // If strict UTF-8 fails, try Windows-1256 (the most common Arabic encoding for .srt files)
  }

  // Attempt Windows-1256 (Arabic CP1256)
  try {
    const win1256Decoder = new TextDecoder('windows-1256', { fatal: false })
    return win1256Decoder.decode(buf)
  } catch (err) {
    console.warn('Windows-1256 decoding failed, falling back to standard UTF-8:', err)
  }

  // Fallback to standard UTF-8
  return new TextDecoder('utf-8').decode(buf)
}

export async function readSubtitleFile(filePath: string): Promise<string> {
  const buf = await fs.promises.readFile(filePath)
  const decoded = decodeSubtitleBuffer(buf)
  // Strip BOM if still present
  return decoded.replace(/^\uFEFF/, '')
}

export async function saveSubtitleFile(
  targetDir: string,
  filename: string,
  content: string
): Promise<string> {
  if (!fs.existsSync(targetDir)) {
    await fs.promises.mkdir(targetDir, { recursive: true })
  }
  const destPath = path.join(targetDir, filename)
  await fs.promises.writeFile(destPath, content, 'utf-8')
  return destPath
}
