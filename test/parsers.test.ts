import { parseMediaFilename } from '../src/shared/utils/filenameParser'
import { parseSRT, parseVTT, parseTimestamp, formatTime } from '../src/shared/utils/subtitleParser'
import { detectLanguageFromFilename, getLanguageName } from '../src/shared/utils/languageCodes'

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

console.log('--- Running Tests ---')

// 1. Filename Parser Tests
const tvTest = parseMediaFilename('The.Last.of.Us.S02E03.1080p.WEB-DL.mkv')
assert(tvTest.cleanTitle === 'The Last of Us', `Expected "The Last of Us", got "${tvTest.cleanTitle}"`)
assert(tvTest.season === 2, `Expected season 2, got ${tvTest.season}`)
assert(tvTest.episode === 3, `Expected episode 3, got ${tvTest.episode}`)
assert(tvTest.resolution === '1080p', `Expected resolution 1080p, got ${tvTest.resolution}`)
assert(tvTest.isSeries === true, 'Expected isSeries to be true')
console.log('✓ TV Show filename parsing passed')

const movieTest = parseMediaFilename('Inception.2010.1080p.BluRay.mkv')
assert(movieTest.cleanTitle === 'Inception', `Expected "Inception", got "${movieTest.cleanTitle}"`)
assert(movieTest.year === 2010, `Expected year 2010, got ${movieTest.year}`)
assert(movieTest.isSeries === false, 'Expected isSeries to be false')
console.log('✓ Movie filename parsing passed')

// 2. Subtitle Timestamp & Time Format Tests
assert(parseTimestamp('00:01:23,450') === 83.45, 'SRT timestamp parsing failed')
assert(parseTimestamp('01:02.500') === 62.5, 'VTT MM:SS.mmm timestamp parsing failed')
assert(formatTime(83) === '01:23', 'Format time 83s failed')
assert(formatTime(3665) === '01:01:05', 'Format time 3665s failed')
console.log('✓ Subtitle timestamps passed')

// 3. SRT Parser Tests
const srtSample = `
1
00:00:01,000 --> 00:00:03,500
First subtitle line

2
00:00:04,200 --> 00:00:07,800
Second subtitle line with
multiple lines
`
const srtCues = parseSRT(srtSample)
assert(srtCues.length === 2, `Expected 2 cues, got ${srtCues.length}`)
assert(srtCues[0].startTime === 1, 'Cue 1 start time mismatch')
assert(srtCues[0].endTime === 3.5, 'Cue 1 end time mismatch')
assert(srtCues[0].text === 'First subtitle line', 'Cue 1 text mismatch')
assert(srtCues[1].text === 'Second subtitle line with\nmultiple lines', 'Cue 2 text mismatch')
console.log('✓ SRT cue parsing passed')

// 4. VTT Parser Tests
const vttSample = `WEBVTT

00:00:02.000 --> 00:00:05.000
VTT subtitle line
`
const vttCues = parseVTT(vttSample)
assert(vttCues.length === 1, `Expected 1 cue, got ${vttCues.length}`)
assert(vttCues[0].startTime === 2, 'VTT start time mismatch')
console.log('✓ VTT cue parsing passed')

// 5. Language Detection & Names
assert(detectLanguageFromFilename('Movie.ar.srt') === 'ar', 'Detect Arabic language code failed')
assert(detectLanguageFromFilename('Movie.English.srt') === 'en', 'Detect English language name failed')
assert(detectLanguageFromFilename('Movie[es].vtt') === 'es', 'Detect Spanish brackets failed')
assert(getLanguageName('ar') === 'Arabic', 'Get language name for ar failed')
// 6. Arabic Encoding Tests (Windows-1256 & UTF-8 with BOM)
import { decodeSubtitleBuffer } from '../src/main/services/localSubtitleService'

const arabicText = 'مرحبا بك في المشغل'
const utf8BomBuf = Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), Buffer.from(arabicText, 'utf-8')])
const decodedUtf8 = decodeSubtitleBuffer(utf8BomBuf)
assert(decodedUtf8 === arabicText, 'UTF-8 with BOM decoding failed')

// Windows-1256 encoded Arabic buffer: مرحبا = [0xE3, 0xD1, 0xCD, 0xC8, 0xC7]
const win1256Buf = Buffer.from([0xE3, 0xD1, 0xCD, 0xC8, 0xC7])
const decodedWin1256 = decodeSubtitleBuffer(win1256Buf)
assert(decodedWin1256 === 'مرحبا', `Windows-1256 decoding failed, got: ${decodedWin1256}`)
console.log('✓ Arabic Windows-1256 and UTF-8 BOM decoding passed')

console.log('ALL UNIT TESTS PASSED SUCCESSFULLY! 🎉')

