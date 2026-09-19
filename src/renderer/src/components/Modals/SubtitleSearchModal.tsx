import React, { useState, useEffect } from 'react'
import { X, Search, Download, Check, Star } from 'lucide-react'
import { SubtitleSearchRequest, SubtitleSearchResult } from '@shared/types/subtitle'
import { ParsedMediaName } from '@shared/utils/filenameParser'
import { SUPPORTED_LANGUAGES } from '@shared/utils/languageCodes'
import { translations, Language } from '../../i18n/translations'

interface SubtitleSearchModalProps {
  isOpen: boolean
  language: Language
  preferredLanguage: string
  parsedMedia: ParsedMediaName | null
  onClose: () => void
  onDownloadAndLoad: (providerId: string, resultId: string) => Promise<void>
}

export const SubtitleSearchModal: React.FC<SubtitleSearchModalProps> = ({
  isOpen,
  language,
  preferredLanguage,
  parsedMedia,
  onClose,
  onDownloadAndLoad
}) => {
  const t = translations[language]

  const [title, setTitle] = useState(parsedMedia?.cleanTitle || '')
  const [year, setYear] = useState<string>(parsedMedia?.year ? String(parsedMedia.year) : '')
  const [season, setSeason] = useState<string>(parsedMedia?.season ? String(parsedMedia.season) : '')
  const [episode, setEpisode] = useState<string>(parsedMedia?.episode ? String(parsedMedia.episode) : '')
  const [selectedLang, setSelectedLang] = useState<string>(preferredLanguage || 'en')

  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SubtitleSearchResult[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadedId, setDownloadedId] = useState<string | null>(null)

  // Update fields when parsedMedia changes or modal opens
  useEffect(() => {
    if (parsedMedia) {
      setTitle(parsedMedia.cleanTitle)
      setYear(parsedMedia.year ? String(parsedMedia.year) : '')
      setSeason(parsedMedia.season ? String(parsedMedia.season) : '')
      setEpisode(parsedMedia.episode ? String(parsedMedia.episode) : '')
    }
  }, [parsedMedia, isOpen])

  // Automatically trigger search on first open
  useEffect(() => {
    if (isOpen && title) {
      handleSearch()
    }
  }, [isOpen])

  const handleSearch = async () => {
    if (!title.trim()) return
    setIsSearching(true)
    setDownloadedId(null)

    const request: SubtitleSearchRequest = {
      filename: parsedMedia?.title || title,
      title: title.trim(),
      year: year ? parseInt(year, 10) : undefined,
      season: season ? parseInt(season, 10) : undefined,
      episode: episode ? parseInt(episode, 10) : undefined,
      language: selectedLang
    }

    try {
      const searchResults = await window.macPlayer.searchSubtitles(request)
      setResults(searchResults)
    } catch (err) {
      console.error('Subtitle search failed:', err)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleDownload = async (providerId: string, resultId: string) => {
    setDownloadingId(resultId)
    try {
      await onDownloadAndLoad(providerId, resultId)
      setDownloadedId(resultId)
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (err) {
      console.error('Download subtitle failed:', err)
    } finally {
      setDownloadingId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', height: '80vh' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-glass)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{t.searchModalTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="glass-button"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Search Parameters Form */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-glass-subtle)',
            backgroundColor: 'var(--card-bg)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                {t.titleLabel}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                {t.languageLabel}
              </label>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '80px' }}>
              <input
                type="text"
                placeholder={t.yearLabel}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ width: '80px' }}>
              <input
                type="text"
                placeholder={t.seasonLabel}
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ width: '80px' }}>
              <input
                type="text"
                placeholder={t.episodeLabel}
                value={episode}
                onChange={(e) => setEpisode(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            <button
              className="glass-button primary"
              onClick={handleSearch}
              disabled={isSearching}
              style={{ marginLeft: 'auto', padding: '8px 18px', fontSize: '13px' }}
            >
              <Search size={14} />
              {isSearching ? t.searching : t.searchButton}
            </button>
          </div>
        </div>

        {/* Search Results List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {isSearching ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
              {t.searching}
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>
              {t.noSubtitlesFound}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.map((res) => {
                const isDownloading = downloadingId === res.id
                const isDownloaded = downloadedId === res.id

                return (
                  <div
                    key={res.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-glass-subtle)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span
                          style={{
                            backgroundColor: res.matchScore >= 90 ? 'rgba(48, 209, 88, 0.18)' : 'rgba(255, 214, 10, 0.18)',
                            color: res.matchScore >= 90 ? 'var(--success)' : 'var(--warning)',
                            border: `1px solid ${res.matchScore >= 90 ? 'rgba(48, 209, 88, 0.3)' : 'rgba(255, 214, 10, 0.3)'}`,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          {res.matchScore}% {t.matchScore}
                        </span>

                        <span
                          style={{
                            fontSize: '11px',
                            backgroundColor: 'var(--btn-glass-bg)',
                            border: '1px solid var(--border-glass-subtle)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-pill)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {res.language}
                        </span>

                        {res.rating && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--warning)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            <Star size={11} fill="currentColor" />
                            {res.rating.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {res.releaseName}
                      </div>
                    </div>

                    <button
                      className={`glass-button ${isDownloaded ? '' : 'primary'}`}
                      disabled={isDownloading || isDownloaded}
                      onClick={() => handleDownload(res.providerId, res.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        backgroundColor: isDownloaded ? 'var(--success)' : undefined
                      }}
                    >
                      {isDownloaded ? (
                        <>
                          <Check size={14} />
                          Loaded
                        </>
                      ) : isDownloading ? (
                        t.downloading
                      ) : (
                        <>
                          <Download size={14} />
                          {t.downloadAndLoad}
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
