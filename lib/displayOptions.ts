export type DisplayOptions = {
  highlightWord: boolean
  showReadLine: boolean
  showProgress: boolean
  showSource: boolean
  showControls: boolean
}

export const DEFAULT_DISPLAY: DisplayOptions = {
  highlightWord: false,
  showReadLine: false,
  showProgress: false,
  showSource: false,
  showControls: false,
}

export const DISPLAY_OPTS: {
  key: keyof DisplayOptions
  label: string
  sub: string
}[] = [
  { key: 'highlightWord', label: 'Highlight word', sub: 'Word-by-word instead of smooth scroll' },
  { key: 'showReadLine', label: 'Read line', sub: 'Guide line on screen' },
  { key: 'showProgress', label: 'Progress bar', sub: 'Show reading progress' },
  { key: 'showSource', label: 'Source info', sub: 'Show article source' },
  { key: 'showControls', label: 'Pause controls', sub: 'Pause button & Space shortcut' },
]
