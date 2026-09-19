export interface ParsedMediaName {
  title: string
  cleanTitle: string
  year?: number
  season?: number
  episode?: number
  resolution?: string
  quality?: string
  source?: string
  releaseGroup?: string
  isSeries: boolean
}

export function parseMediaFilename(rawFilename: string): ParsedMediaName {
  // Strip file extension
  const filenameWithoutExt = rawFilename.replace(/\.[a-zA-Z0-9]{2,5}$/, '')

  // Standardize delimiters (dots, underscores, dashes to spaces for easier regex parsing)
  const normalized = filenameWithoutExt.trim()

  let isSeries = false
  let season: number | undefined
  let episode: number | undefined
  let year: number | undefined
  let resolution: string | undefined
  let quality: string | undefined
  let source: string | undefined
  let releaseGroup: string | undefined

  // 1. Detect Season and Episode: S01E02 or s1e2 or 1x02
  const seasonEpisodeRegex = /[sS](\d{1,2})[eE](\d{1,3})|(\d{1,2})x(\d{1,3})/
  const seMatch = normalized.match(seasonEpisodeRegex)
  if (seMatch) {
    isSeries = true
    if (seMatch[1] && seMatch[2]) {
      season = parseInt(seMatch[1], 10)
      episode = parseInt(seMatch[2], 10)
    } else if (seMatch[3] && seMatch[4]) {
      season = parseInt(seMatch[3], 10)
      episode = parseInt(seMatch[4], 10)
    }
  }

  // 2. Detect Year (e.g. 1920-2099)
  const yearRegex = /\b(19\d\d|20\d\d)\b/
  const yearMatch = normalized.match(yearRegex)
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10)
  }

  // 3. Detect Resolution
  const resRegex = /\b(2160p|4k|1080p|1080i|720p|576p|480p)\b/i
  const resMatch = normalized.match(resRegex)
  if (resMatch) {
    resolution = resMatch[1].toLowerCase()
  }

  // 4. Detect Source / Quality (BluRay, WEB-DL, WEBRip, HDTV, DVDRip, etc.)
  const sourceRegex = /\b(BluRay|BDRip|BRRip|WEB-DL|WEBRip|HDTV|DVDRip|HDRip|CAM|TS)\b/i
  const sourceMatch = normalized.match(sourceRegex)
  if (sourceMatch) {
    source = sourceMatch[1]
    quality = sourceMatch[1]
  }

  // 5. Extract Title
  // The title typically comes before the season/episode or year
  let titlePart = normalized

  if (seMatch && seMatch.index !== undefined) {
    titlePart = normalized.substring(0, seMatch.index)
  } else if (yearMatch && yearMatch.index !== undefined) {
    titlePart = normalized.substring(0, yearMatch.index)
  } else if (resMatch && resMatch.index !== undefined) {
    titlePart = normalized.substring(0, resMatch.index)
  }

  // Clean title: replace dots, underscores, brackets with spaces
  let cleanTitle = titlePart
    .replace(/[._\-+]/g, ' ')
    .replace(/[\[\](){}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleanTitle) {
    cleanTitle = filenameWithoutExt
  }

  return {
    title: filenameWithoutExt,
    cleanTitle,
    year,
    season,
    episode,
    resolution,
    quality,
    source,
    releaseGroup,
    isSeries
  }
}
