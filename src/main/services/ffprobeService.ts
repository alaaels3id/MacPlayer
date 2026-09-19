import { execFile } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import path from 'path'
import { MediaMetadata, AudioTrack, EmbeddedSubtitleTrack } from '../../shared/types/media'

const execFileAsync = promisify(execFile)

function getFFprobePath(): string {
  const possiblePaths = [
    '/opt/homebrew/bin/ffprobe',
    '/usr/local/bin/ffprobe',
    'ffprobe'
  ]

  for (const p of possiblePaths) {
    if (p === 'ffprobe' || fs.existsSync(p)) {
      return p
    }
  }
  return 'ffprobe'
}

interface FFprobeStream {
  codec_type?: string
  codec_name?: string
  width?: number
  height?: number
  r_frame_rate?: string
  channels?: number
  tags?: {
    language?: string
    title?: string
    [key: string]: any
  }
  disposition?: {
    default?: number
    [key: string]: any
  }
}

interface FFprobeFormat {
  filename?: string
  duration?: string
  size?: string
  format_name?: string
}

interface FFprobeOutput {
  streams?: FFprobeStream[]
  format?: FFprobeFormat
}

export async function probeMediaFile(filePath: string): Promise<MediaMetadata> {
  const ffprobePath = getFFprobePath()
  const args = [
    '-v',
    'quiet',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    filePath
  ]

  try {
    const { stdout } = await execFileAsync(ffprobePath, args, { maxBuffer: 10 * 1024 * 1024 })
    const data: FFprobeOutput = JSON.parse(stdout)

    const streams = data.streams || []
    const format = data.format || {}

    const videoStream = streams.find((s) => s.codec_type === 'video')
    const audioStreams = streams.filter((s) => s.codec_type === 'audio')
    const subtitleStreams = streams.filter((s) => s.codec_type === 'subtitle')

    // Parse FPS
    let fps = 24
    if (videoStream?.r_frame_rate) {
      const [num, den] = videoStream.r_frame_rate.split('/').map(Number)
      if (num && den) {
        fps = Math.round((num / den) * 100) / 100
      }
    }

    const audioTracks: AudioTrack[] = audioStreams.map((s, index) => ({
      id: index,
      title: s.tags?.title || `Audio Track ${index + 1}`,
      language: s.tags?.language || 'und',
      codec: s.codec_name || 'unknown',
      channels: s.channels || 2
    }))

    const embeddedSubtitles: EmbeddedSubtitleTrack[] = subtitleStreams.map((s, index) => ({
      id: index,
      title: s.tags?.title || `Subtitle ${index + 1}`,
      language: s.tags?.language || 'und',
      codec: s.codec_name || 'unknown',
      isDefault: s.disposition?.default === 1
    }))

    const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null

    return {
      filename: path.basename(filePath),
      filePath,
      duration: parseFloat(format.duration || '0') || 0,
      width: videoStream?.width || 1920,
      height: videoStream?.height || 1080,
      videoCodec: videoStream?.codec_name || 'unknown',
      audioCodec: audioStreams[0]?.codec_name || 'unknown',
      fps,
      fileSize: stats ? stats.size : parseInt(format.size || '0', 10) || 0,
      formatName: format.format_name || path.extname(filePath).replace('.', ''),
      audioTracks,
      embeddedSubtitles
    }
  } catch (err) {
    console.warn('ffprobe execution failed or not available, falling back to file stats:', err)
    const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null
    const filename = path.basename(filePath)

    return {
      filename,
      filePath,
      duration: 0,
      width: 1920,
      height: 1080,
      videoCodec: 'native',
      audioCodec: 'native',
      fps: 24,
      fileSize: stats?.size || 0,
      formatName: path.extname(filePath).replace('.', ''),
      audioTracks: [{ id: 0, title: 'Default Audio', language: 'und', codec: 'native', channels: 2 }],
      embeddedSubtitles: []
    }
  }
}
