'use client'

import type { ReviewData } from '@/app/page'
import styles from './ReviewPanel.module.css'

export default function ReviewPanel({
  review,
  onRestart,
}: {
  review: ReviewData | null
  onRestart: () => void
}) {
  if (!review) {
    return (
      <div className={styles.panel}>
        <div className={styles.card}>
          <div className={styles.loading}>
            <div className={styles.dots}>
              <span /><span /><span />
            </div>
            Analysing your response…
          </div>
        </div>
      </div>
    )
  }

  const scoreColor =
    review.score >= 80 ? '#5dcaa5' : review.score >= 60 ? '#efb84a' : '#f07b5b'
  const scoreBg =
    review.score >= 80 ? 'rgba(29,158,117,0.15)' : review.score >= 60 ? 'rgba(186,117,23,0.15)' : 'rgba(216,90,48,0.15)'

  return (
    <div className={styles.panel}>
      <div className={styles.card}>
        <p className={styles.sectionLabel}>Coach&apos;s review</p>

        <div className={styles.scoreRow}>
          <div className={styles.scoreBox} style={{ background: scoreBg }}>
            <span className={styles.scoreNum} style={{ color: scoreColor }}>{review.score}</span>
            <span className={styles.scoreLabel} style={{ color: scoreColor }}>{review.scoreLabel}</span>
          </div>
          <p className={styles.scoreDesc}>
            Here is your personalised feedback based on the passage and your response.
          </p>
        </div>

        {review.positives.length > 0 && (
          <section className={styles.section}>
            <p className={styles.subLabel}>What you did well</p>
            {review.positives.map((p, i) => (
              <div key={i} className={styles.positiveRow}>
                <span className={styles.check}>✓</span>
                <span className={styles.positiveText}>{p}</span>
              </div>
            ))}
          </section>
        )}

        {review.corrections.length > 0 && (
          <section className={styles.section}>
            <p className={styles.subLabel}>Corrections</p>
            {review.corrections.map((c, i) => (
              <div key={i} className={styles.correctionCard}>
                <div className={styles.corrRow}>
                  <span className={styles.tagFix}>Original</span>
                  <span className={styles.corrText}>{c.original}</span>
                </div>
                <div className={styles.corrRow}>
                  <span className={styles.tagGood}>Corrected</span>
                  <span className={styles.corrBetter}>{c.correction}</span>
                </div>
                <p className={styles.corrExplain}>{c.explanation}</p>
              </div>
            ))}
          </section>
        )}

        {review.vocab.length > 0 && (
          <section className={styles.section}>
            <p className={styles.subLabel}>Key vocabulary</p>
            {review.vocab.map((v, i) => (
              <div key={i} className={styles.vocabItem}>
                <span className={styles.vocabWord}>{v.word}</span>
                <span className={styles.vocabDef}>{v.definition}</span>
              </div>
            ))}
          </section>
        )}
      </div>

      <button className={styles.restartBtn} onClick={onRestart}>
        ↺ Start a new session
      </button>
    </div>
  )
}
