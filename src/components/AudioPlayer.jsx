import { useState, useRef, useEffect } from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import {
  PlayIcon, PauseIcon,
  CounterClockwiseClockIcon, SpeakerLoudIcon, SpeakerOffIcon
} from '@radix-ui/react-icons'
import { Tooltip } from './Tooltip'

const BACKEND = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000'

export default function AudioPlayer({ src, title, compact = false, limit = 60 }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [ended, setEnded] = useState(false)

  const audioSrc = src.startsWith('http') ? src : `${BACKEND}${src}`
  const previewDuration = duration > 0 ? Math.min(limit, duration) : limit

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => {
      const t = audio.currentTime
      if (t >= limit) {
        audio.pause()
        audio.currentTime = 0
        setCurrentTime(0)
        setPlaying(false)
        setEnded(true)
        return
      }
      setCurrentTime(t)
      setEnded(false)
    }
    const onLoaded = () => setDuration(audio.duration)
    const onEnded = () => { setPlaying(false); setEnded(true) }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [limit])

  const togglePlay = () => {
    const audio = audioRef.current
    if (playing) { audio.pause(); setPlaying(false) }
    else { setEnded(false); audio.play(); setPlaying(true) }
  }

  const handleRestart = () => {
    const audio = audioRef.current
    audio.currentTime = 0
    setEnded(false)
    audio.play()
    setPlaying(true)
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    const seekTo = ratio * previewDuration
    audio.currentTime = seekTo
    setCurrentTime(seekTo)
    setEnded(false)
  }

  const handleVolume = (e) => {
    const val = Number(e.target.value)
    audioRef.current.volume = val
    setVolume(val)
  }

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progress = previewDuration > 0 ? Math.min((currentTime / previewDuration) * 100, 100) : 0
  const limitLabel = limit >= 60 ? `${Math.floor(limit / 60)} min` : `${limit}s`

  const playerStyle = compact
    ? { ...styles.player, padding: '0.65rem 0.85rem', borderRadius: '10px', marginBottom: 0 }
    : styles.player

  return (
    <div style={playerStyle}>
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      {!compact && (
        <div style={styles.topRow}>
          <span style={styles.titleText}>🎵 {title || 'Extrait audio'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={styles.limitBadge}>Extrait {limitLabel}</span>
            <span style={styles.timeText}>{fmt(currentTime)} / {fmt(previewDuration)}</span>
          </div>
        </div>
      )}

      <div
        style={{ ...styles.progressWrap, marginBottom: compact ? '0.5rem' : '1rem' }}
        onClick={handleSeek}
      >
        <div style={styles.progressBg} />
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        {!ended && <div style={{ ...styles.progressThumb, left: `${progress}%` }} />}
      </div>

      {ended && !compact && (
        <p style={styles.endedMsg}>
          Fin de l'extrait —{' '}
          <button style={styles.replayLink} onClick={handleRestart}>Réécouter</button>
          {' '}ou achetez pour la version complète.
        </p>
      )}

      <div style={styles.controls}>
        <Tooltip content="Recommencer" side="top">
          <button style={styles.ctrlBtn} onClick={handleRestart}>
            <CounterClockwiseClockIcon width={15} height={15} />
          </button>
        </Tooltip>

        <Tooltip content={playing ? 'Pause' : 'Lecture'} side="top">
          <button
            style={compact
              ? { ...styles.playPauseBtn, width: '32px', height: '32px' }
              : styles.playPauseBtn}
            onClick={togglePlay}
          >
            {playing
              ? <PauseIcon width={16} height={16} />
              : <PlayIcon width={16} height={16} />}
          </button>
        </Tooltip>

        {compact && (
          <span style={{ ...styles.timeText, marginLeft: '0.1rem' }}>
            {fmt(currentTime)} / {fmt(previewDuration)}
            <span style={{ ...styles.limitBadge, marginLeft: '0.4rem', fontSize: '0.6rem' }}>
              Extrait {limitLabel}
            </span>
          </span>
        )}

        <div style={styles.volumeWrap}>
          <Tooltip content={volume === 0 ? 'Son coupé' : 'Volume'} side="top">
            <span style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
              {volume === 0
                ? <SpeakerOffIcon width={16} height={16} style={{ color: '#7d5560' }} />
                : <SpeakerLoudIcon width={16} height={16} style={{ color: '#c9a4ac' }} />}
            </span>
          </Tooltip>
          <SliderPrimitive.Root
            style={{ ...sliderStyles.root, width: compact ? '55px' : '72px' }}
            min={0} max={1} step={0.05}
            value={[volume]}
            onValueChange={([val]) => { audioRef.current.volume = val; setVolume(val) }}
          >
            <SliderPrimitive.Track style={sliderStyles.track}>
              <SliderPrimitive.Range style={sliderStyles.range} />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb style={sliderStyles.thumb} aria-label="Volume" />
          </SliderPrimitive.Root>
        </div>
      </div>
    </div>
  )
}

const styles = {
  player: {
    background: 'rgba(124,58,237,0.08)',
    border: '1px solid rgba(124,58,237,0.25)',
    borderRadius: '14px',
    padding: '1rem 1.25rem',
    marginBottom: '1.25rem',
  },
  topRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem',
  },
  titleText: { color: '#e8ca55', fontSize: '0.85rem', fontWeight: 600 },
  timeText: { color: '#7d5560', fontSize: '0.75rem', fontFamily: 'monospace' },
  limitBadge: {
    background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
    border: '1px solid rgba(245,158,11,0.3)', borderRadius: '100px',
    fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.5rem', letterSpacing: '0.03em',
  },
  progressWrap: { position: 'relative', height: '6px', cursor: 'pointer', marginBottom: '1rem' },
  progressBg: { position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.08)', borderRadius: '3px' },
  progressFill: {
    position: 'absolute', top: 0, left: 0, height: '100%',
    background: 'linear-gradient(90deg, #ddba3c, #f59e0b)',
    borderRadius: '3px', transition: 'width 0.1s linear',
  },
  progressThumb: {
    position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
    width: '12px', height: '12px', borderRadius: '50%',
    background: '#faeee0', boxShadow: '0 0 4px rgba(124,58,237,0.6)',
  },
  controls: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  ctrlBtn: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid #3d2020',
    borderRadius: '8px', color: '#c9a4ac', cursor: 'pointer',
    padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center', transition: 'all 0.15s',
  },
  playPauseBtn: {
    background: '#ddba3c', border: 'none', borderRadius: '50%',
    color: 'white', cursor: 'pointer', width: '40px', height: '40px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'all 0.15s',
  },
  volumeWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' },
  endedMsg: { fontSize: '0.78rem', color: '#c9a4ac', marginBottom: '0.75rem', fontStyle: 'italic' },
  replayLink: {
    background: 'none', border: 'none', color: '#e8ca55', cursor: 'pointer',
    fontStyle: 'normal', fontWeight: 600, padding: 0, fontSize: '0.78rem', textDecoration: 'underline',
  },
}

const sliderStyles = {
  root: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none',
    touchAction: 'none',
    height: '20px',
    cursor: 'pointer',
  },
  track: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    position: 'relative',
    flexGrow: 1,
    borderRadius: '9999px',
    height: '3px',
  },
  range: {
    position: 'absolute',
    background: 'linear-gradient(90deg, #ddba3c, #e8ca55)',
    borderRadius: '9999px',
    height: '100%',
  },
  thumb: {
    display: 'block',
    width: '14px',
    height: '14px',
    background: '#faeee0',
    borderRadius: '50%',
    boxShadow: '0 1px 6px rgba(0,0,0,0.4)',
    border: '2px solid #ddba3c',
    outline: 'none',
    cursor: 'grab',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
}
