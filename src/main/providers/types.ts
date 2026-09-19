import { SubtitleSearchRequest, SubtitleSearchResult } from '../../shared/types/subtitle'

export interface SubtitleProvider {
  id: string
  name: string
  isEnabled(): boolean
  search(request: SubtitleSearchRequest): Promise<SubtitleSearchResult[]>
  download(resultId: string, downloadDir: string): Promise<{ filePath: string; content: string }>
}
