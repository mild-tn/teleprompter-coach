'use client'

import { useState } from 'react'
import type { ContentSourceId, SessionConfig } from '@/app/page'
import styles from './SetupPanel.module.css'

const LEVELS = [
  { val: 'beginner', label: 'Beginner', sub: 'A1 – A2', icon: '🌱' },
  { val: 'intermediate', label: 'Intermediate', sub: 'B1 – B2', icon: '🌿' },
  { val: 'advanced', label: 'Advanced', sub: 'C1 – C2', icon: '🌲' },
]

const GENRES = [
  { val: 'random', label: '🎲 Random' },
  { val: 'news', label: '📰 News' },
  { val: 'science', label: '🔬 Science' },
  { val: 'fiction', label: '📚 Fiction' },
  { val: 'business', label: '💼 Business' },
  { val: 'travel', label: '✈️ Travel' },
  { val: 'health', label: '🏥 Health' },
  { val: 'technology', label: '💻 Technology' },
]

const SPEEDS = [
  { val: 'slow', label: 'Slow', sub: '~90 WPM', wpm: 90, color: '#1d9e75' },
  { val: 'medium', label: 'Medium', sub: '~150 WPM', wpm: 150, color: '#ba7517' },
  { val: 'fast', label: 'Fast', sub: '~200+ WPM', wpm: 200, color: '#d85a30' },
]

const SOURCES: {
  val: ContentSourceId
  label: string
  sub: string
  icon: string
  desc: string
  note?: string
}[] = [
  {
    val: 'shortstories',
    label: 'Short Stories',
    sub: 'Aesop & fables',
    icon: '📚',
    desc: 'Free Short Stories API — random tales with full text, no API key needed.',
    note: 'shortstories-api.onrender.com',
  },
  {
    val: 'wikipedia',
    label: 'Wikipedia',
    sub: 'Encyclopedia',
    icon: '🌐',
    desc: 'Real Wikipedia articles filtered by your genre — science, news, travel, and more.',
    note: 'en.wikipedia.org',
  },
  {
    val: 'literature',
    label: 'Classic Literature',
    sub: 'Public domain',
    icon: '📜',
    desc: 'Passages from classic books via the Words API. Beginner level uses short stories instead.',
    note: 'words.biebersprojects.com',
  },
]

export default function SetupPanel({
  loading,
  onStart,
}: {
  loading: boolean
  onStart: (cfg: SessionConfig) => void
}) {
  const [level, setLevel] = useState('')
  const [genre, setGenre] = useState('')
  const [speed, setSpeed] = useState('')
  const [contentSource, setContentSource] = useState<ContentSourceId>('shortstories')

  const canStart = level && genre && speed && !loading
  const selectedSource = SOURCES.find((s) => s.val === contentSource)

  const handleStart = () => {
    const s = SPEEDS.find((sp) => sp.val === speed)!
    onStart({ level, genre, speed, wpm: s.wpm, contentSource })
  }

  return (
    <div className={styles.panel}>
      <section className={styles.card}>
        <p className={styles.sectionLabel}>Content source</p>
        <div className={styles.threeGrid}>
          {SOURCES.map((s) => (
            <button
              key={s.val}
              className={`${styles.optBtn} ${contentSource === s.val ? styles.optSelected : ''}`}
              onClick={() => setContentSource(s.val)}
            >
              <span className={styles.optIcon}>{s.icon}</span>
              <span className={styles.optLabel}>{s.label}</span>
              <span className={styles.optSub}>{s.sub}</span>
            </button>
          ))}
        </div>
        <p className={styles.sourceDesc}>{selectedSource?.desc}</p>
        {selectedSource?.note && (
          <div className={styles.sourceNote}>
            📡 API: <strong>{selectedSource.note}</strong> — free, no API key required.
          </div>
        )}
      </section>

      <section className={styles.card}>
        <p className={styles.sectionLabel}>Difficulty level</p>
        <div className={styles.threeGrid}>
          {LEVELS.map((l) => (
            <button
              key={l.val}
              className={`${styles.optBtn} ${level === l.val ? styles.optSelected : ''}`}
              onClick={() => setLevel(l.val)}
            >
              <span className={styles.optIcon}>{l.icon}</span>
              <span className={styles.optLabel}>{l.label}</span>
              <span className={styles.optSub}>{l.sub}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <p className={styles.sectionLabel}>Content genre</p>
        <div className={styles.genreGrid}>
          {GENRES.map((g) => (
            <button
              key={g.val}
              className={`${styles.genrePill} ${genre === g.val ? styles.genreSelected : ''}`}
              onClick={() => setGenre(g.val)}
            >
              {g.label}
            </button>
          ))}
        </div>
        {contentSource === 'wikipedia' && (
          <p className={styles.sourceDesc} style={{ marginTop: '0.75rem' }}>
            Genre filters which Wikipedia topics are searched.
          </p>
        )}
      </section>

      <section className={styles.card}>
        <p className={styles.sectionLabel}>Scroll speed</p>
        <div className={styles.threeGrid}>
          {SPEEDS.map((s) => (
            <button
              key={s.val}
              className={`${styles.optBtn} ${speed === s.val ? styles.optSelected : ''}`}
              onClick={() => setSpeed(s.val)}
            >
              <span className={styles.speedDot} style={{ background: s.color }} />
              <span className={styles.optLabel}>{s.label}</span>
              <span className={styles.optSub}>{s.sub}</span>
            </button>
          ))}
        </div>
      </section>

      <button className={styles.startBtn} disabled={!canStart} onClick={handleStart}>
        {loading ? '📡 Loading passage…' : '▶  Begin Reading Session'}
      </button>
    </div>
  )
}
