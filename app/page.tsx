'use client'

import { useState } from 'react'
import SetupPanel from '@/components/SetupPanel'
import ReadingPanel from '@/components/ReadingPanel'
import ThemeToggle from '@/components/ThemeToggle'

export type AppState = 'setup' | 'loading' | 'reading'

export type ContentSourceId = 'shortstories' | 'wikipedia' | 'literature'

export type SessionConfig = {
  level: string
  genre: string
  speed: string
  wpm: number
  contentSource: ContentSourceId
}

export type PassageData = {
  title: string
  source: string
  sourceUrl: string
  chunks: string[]
  vocab: { word: string; definition: string }[]
}

export type ReviewData = {
  score: number
  scoreLabel: string
  positives: string[]
  corrections: { original: string; correction: string; explanation: string }[]
  vocab: { word: string; definition: string }[]
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('setup')
  const [config, setConfig] = useState<SessionConfig | null>(null)
  const [passage, setPassage] = useState<PassageData | null>(null)

  const handleStart = async (cfg: SessionConfig) => {
    setConfig(cfg)
    setAppState('loading')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: cfg.level, genre: cfg.genre, contentSource: cfg.contentSource }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'Failed to load passage')
      }
      setPassage(data as PassageData)
      setAppState('reading')
    } catch (e) {
      setAppState('setup')
      alert(e instanceof Error ? e.message : 'Failed to load passage. Please try again.')
    }
  }

  const handleExit = () => {
    setConfig(null)
    setPassage(null)
    setAppState('setup')
  }

  return (
    <>
      {appState !== 'reading' && (
        <main style={{ minHeight: '100vh', padding: '2rem 1rem', maxWidth: '680px', margin: '0 auto' }}>
          <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 40, height: 40,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>📖</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
                Teleprompter & Reading Coach
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                Reading speed & comprehension trainer
              </p>
            </div>
            <ThemeToggle />
          </header>

          {(appState === 'setup' || appState === 'loading') && (
            <SetupPanel loading={appState === 'loading'} onStart={handleStart} />
          )}
        </main>
      )}

      {appState === 'reading' && passage && config && (
        <ReadingPanel
          passage={passage}
          wpm={config.wpm}
          onExit={handleExit}
        />
      )}
    </>
  )
}
