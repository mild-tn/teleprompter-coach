'use client'

import { useState } from 'react'
import styles from './TaskPanel.module.css'

export default function TaskPanel({
  title,
  onSubmit,
}: {
  title: string
  onSubmit: (taskType: string, answer: string) => void
}) {
  const [taskType, setTaskType] = useState('')
  const [answer, setAnswer] = useState('')

  return (
    <div className={styles.panel}>
      <div className={styles.card}>
        <p className={styles.congrats}>
          ✓ You finished <strong>&ldquo;{title}&rdquo;</strong>. Great work!
        </p>
        <p className={styles.prompt}>Now choose what to do next:</p>

        <div className={styles.choiceRow}>
          <button
            className={`${styles.choiceBtn} ${taskType === 'translate' ? styles.choiceSelected : ''}`}
            onClick={() => setTaskType('translate')}
          >
            <span className={styles.choiceIcon}>🇹🇭</span>
            <span className={styles.choiceLabel}>Translate to Thai</span>
            <span className={styles.choiceSub}>แปลเป็นภาษาไทย</span>
          </button>
          <button
            className={`${styles.choiceBtn} ${taskType === 'summarize' ? styles.choiceSelected : ''}`}
            onClick={() => setTaskType('summarize')}
          >
            <span className={styles.choiceIcon}>📝</span>
            <span className={styles.choiceLabel}>Summarize</span>
            <span className={styles.choiceSub}>In your own words</span>
          </button>
        </div>

        {taskType && (
          <div className={styles.inputArea}>
            <textarea
              className={styles.textarea}
              placeholder={
                taskType === 'translate'
                  ? 'แปลข้อความที่คุณอ่านเป็นภาษาไทยที่นี่…'
                  : 'Write a summary of what you just read…'
              }
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              autoFocus
            />
            <button
              className={styles.submitBtn}
              disabled={answer.trim().length < 10}
              onClick={() => onSubmit(taskType, answer)}
            >
              Submit for review →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
