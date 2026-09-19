export interface AudioTrack {
  id: number
  title: string
  language: string
  codec: string
  channels: number
}

export interface EmbeddedSubtitleTrack {
  id: number
  title: string
  language: string
  codec: string
  isDefault: boolean
}

export interface MediaMetadata {
  filename: string
  filePath: string
  duration: number
  width: number
  height: number
  videoCodec: string
  audioCodec: string
  fps: number
  fileSize: number
  formatName: string
  audioTracks: AudioTrack[]
  embeddedSubtitles: EmbeddedSubtitleTrack[]
}

export interface RecentVideo {
  id: string
  filePath: string
  filename: string
  title: string
  duration: number
  lastPosition: number
  lastPlayedAt: number
  fileSize: number
}
