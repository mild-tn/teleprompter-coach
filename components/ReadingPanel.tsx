'use client'

import { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'
import type { PassageData } from '@/app/page'
import {
  DEFAULT_DISPLAY,
  DISPLAY_OPTS,
  type DisplayOptions,
} from '@/lib/displayOptions'
import ThemeToggle from './ThemeToggle'
import styles from './ReadingPanel.module.css'

const READ_LINE_RATIO = 0.38

function getTranslateY(el: HTMLElement): number {
  const matrix = new DOMMatrix(window.getComputedStyle(el).transform)
  return matrix.m42
}

export default function ReadingPanel({
  passage,
  wpm,
  onExit,
}: {
  passage: PassageData
  wpm: number
  onExit: () => void
}) {
  const words = useMemo(
    () => passage.chunks.join(' ').split(/\s+/).filter(Boolean),
    [passage.chunks],
  )

  const [display, setDisplay] = useState<DisplayOptions>({ ...DEFAULT_DISPLAY })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)
  const [smoothProgress, setSmoothProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isDone, setIsDone] = useState(false)
  const [restartKey, setRestartKey] = useState(0)

  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const pausedAtRef = useRef<number | null>(null)
  const totalPausedRef = useRef(0)

  const wordMode = display.highlightWord
  const msPerWord = 60000 / wpm
  const progress = wordMode
    ? Math.round(((wordIndex + 1) / words.length) * 100)
    : smoothProgress

  const toggleDisplay = (key: keyof DisplayOptions) => {
    setDisplay((d) => ({ ...d, [key]: !d[key] }))
  }

  const resetReading = () => {
    setWordIndex(0)
    setSmoothProgress(0)
    setIsDone(false)
    setIsPlaying(true)
    totalPausedRef.current = 0
    pausedAtRef.current = null
    if (contentRef.current) contentRef.current.style.transform = ''
    setRestartKey((k) => k + 1)
  }

  // Reset scroll when switching scroll mode
  useEffect(() => {
    setWordIndex(0)
    setSmoothProgress(0)
    setIsDone(false)
    setIsPlaying(true)
    totalPausedRef.current = 0
    pausedAtRef.current = null
    if (contentRef.current) contentRef.current.style.transform = ''
  }, [wordMode])

  useEffect(() => {
    if (wordMode || isDone) return

    const content = contentRef.current
    const viewport = viewportRef.current
    if (!content || !viewport) return

    const startY = viewport.clientHeight * 0.72
    const scrollDistance = content.scrollHeight + startY - viewport.clientHeight * 0.28
    const duration = (words.length / wpm) * 60 * 1000

    let raf = 0
    let startTime: number | null = null

    const tick = (now: number) => {
      if (!isPlaying) {
        if (pausedAtRef.current === null) pausedAtRef.current = now
        raf = requestAnimationFrame(tick)
        return
      }
      if (pausedAtRef.current !== null) {
        totalPausedRef.current += now - pausedAtRef.current
        pausedAtRef.current = null
      }

      if (startTime === null) startTime = now
      const elapsed = now - startTime - totalPausedRef.current
      const t = Math.min(elapsed / duration, 1)
      const y = startY - scrollDistance * t
      content.style.transform = `translateY(${y}px)`
      setSmoothProgress(Math.round(t * 100))

      if (t >= 1) {
        setIsDone(true)
        setIsPlaying(false)
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [wordMode, isPlaying, isDone, wpm, words.length, restartKey])

  useEffect(() => {
    if (!wordMode || !isPlaying || isDone) return

    if (wordIndex >= words.length - 1) {
      const timer = setTimeout(() => {
        setIsDone(true)
        setIsPlaying(false)
      }, 1200)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => setWordIndex((i) => i + 1), msPerWord)
    return () => clearTimeout(timer)
  }, [wordMode, wordIndex, isPlaying, isDone, msPerWord, words.length, restartKey])

  useLayoutEffect(() => {
    if (!wordMode) return

    const wordEl = wordRefs.current[wordIndex]
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!wordEl || !viewport || !content) return

    const readLineY =
      viewport.getBoundingClientRect().top + viewport.clientHeight * READ_LINE_RATIO
    const wordCenterY =
      wordEl.getBoundingClientRect().top + wordEl.getBoundingClientRect().height / 2
    const delta = readLineY - wordCenterY

    content.style.transform = `translateY(${getTranslateY(content) + delta}px)`
  }, [wordIndex, words.length, wordMode])

  useEffect(() => {
    if (!display.showControls) return

    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        if (!isDone) setIsPlaying((p) => !p)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isDone, display.showControls])

  const isExternalSource = passage.source && passage.source !== 'AI Generated'

  return (
    <div className={styles.stage}>
      <button
        type="button"
        className={styles.settingsBtn}
        onClick={() => setSettingsOpen((o) => !o)}
        aria-label="Display options"
        title="Display options"
      >
        ⚙️
      </button>

      {settingsOpen && (
        <>
          <div className={styles.settingsBackdrop} onClick={() => setSettingsOpen(false)} />
          <div className={styles.settingsPanel}>
            <div className={styles.settingsHeader}>
              <span className={styles.settingsTitle}>Display options</span>
              <button
                type="button"
                className={styles.settingsClose}
                onClick={() => setSettingsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.toggleList}>
              {DISPLAY_OPTS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`${styles.toggleRow} ${display[opt.key] ? styles.toggleOn : ''}`}
                  onClick={() => toggleDisplay(opt.key)}
                >
                  <span className={styles.toggleCheck}>{display[opt.key] ? '✓' : ''}</span>
                  <span className={styles.toggleText}>
                    <span className={styles.toggleLabel}>{opt.label}</span>
                    <span className={styles.toggleSub}>{opt.sub}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className={styles.settingsFooter}>
              <span className={styles.settingsFooterLabel}>Theme</span>
              <ThemeToggle />
            </div>

            <button type="button" className={styles.restartBtn} onClick={resetReading}>
              ↺ Restart reading
            </button>

            <button type="button" className={styles.exitBtn} onClick={onExit}>
              ← Back to setup
            </button>
          </div>
        </>
      )}

      {display.showSource && isExternalSource && (
        <div className={styles.sourceBadge}>
          {passage.sourceUrl ? (
            <a href={passage.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
              {passage.source} ↗
            </a>
          ) : (
            <span>{passage.source}</span>
          )}
        </div>
      )}

      {display.showProgress && (
        <div className={styles.progressWrap}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className={styles.viewport} ref={viewportRef}>
        {display.showReadLine && <div className={styles.readLine} />}

        <div
          className={`${styles.content} ${wordMode ? styles.contentWordMode : ''}`}
          ref={contentRef}
        >
          <p className={styles.text}>
            {wordMode
              ? words.map((word, i) => (
                  <span
                    key={i}
                    ref={(el) => { wordRefs.current[i] = el }}
                    className={[
                      styles.word,
                      i < wordIndex ? styles.wordPast : '',
                      i === wordIndex ? styles.wordCurrent : '',
                      i > wordIndex ? styles.wordFuture : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {word}{' '}
                  </span>
                ))
              : passage.chunks.map((chunk, i) => (
                  <span key={i}>
                    {chunk}
                    {i < passage.chunks.length - 1 ? ' ' : ''}
                  </span>
                ))}
          </p>
        </div>
      </div>

      {display.showControls && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlBtn}
            onClick={() => !isDone && setIsPlaying((p) => !p)}
            disabled={isDone}
          >
            {isDone ? '✓ Done' : isPlaying ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button type="button" className={styles.controlBtn} onClick={resetReading}>
            ↺ Restart
          </button>
          <span className={styles.hint}>
            {isDone
              ? 'Reading complete'
              : isPlaying
                ? 'Space to pause'
                : 'Space to resume'}
          </span>
        </div>
      )}

      {isDone && !settingsOpen && (
        <div className={styles.doneBar}>
          <span>Reading complete</span>
          <button type="button" className={styles.doneBtnSecondary} onClick={resetReading}>
            ↺ Restart
          </button>
          <button type="button" className={styles.doneBtn} onClick={onExit}>
            New session
          </button>
        </div>
      )}
    </div>
  )
}
