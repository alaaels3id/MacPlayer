import { SubtitleProvider } from './types'
import { OpenSubtitlesProvider } from './openSubtitlesProvider'
import { SubtitleSearchRequest, SubtitleSearchResult } from '../../shared/types/subtitle'

export class ProviderManager {
  private providers: Map<string, SubtitleProvider> = new Map()

  constructor(openSubtitlesApiKey?: string) {
    const osProvider = new OpenSubtitlesProvider(openSubtitlesApiKey)
    this.providers.set(osProvider.id, osProvider)
  }

  public getProvider(id: string): SubtitleProvider | undefined {
    return this.providers.get(id)
  }

  public updateOpenSubtitlesKey(apiKey?: string): void {
    const os = this.providers.get('opensubtitles') as OpenSubtitlesProvider
    if (os) {
      os.setApiKey(apiKey)
    }
  }

  public async searchAll(request: SubtitleSearchRequest): Promise<SubtitleSearchResult[]> {
    const allResults: SubtitleSearchResult[] = []

    for (const provider of this.providers.values()) {
      if (provider.isEnabled()) {
        try {
          const results = await provider.search(request)
          allResults.push(...results)
        } catch (err) {
          console.error(`Provider ${provider.name} search failed:`, err)
        }
      }
    }

    // Sort descending by matchScore
    return allResults.sort((a, b) => b.matchScore - a.matchScore)
  }

  public async downloadSubtitle(
    providerId: string,
    resultId: string,
    downloadDir: string
  ): Promise<{ filePath: string; content: string }> {
    const provider = this.providers.get(providerId)
    if (!provider) {
      throw new Error(`Subtitle provider not found: ${providerId}`)
    }
    return await provider.download(resultId, downloadDir)
  }
}
