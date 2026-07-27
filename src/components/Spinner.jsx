export default function Spinner({ text = 'Chargement...' }) {
  return (
    <div className="spinner-wrapper" style={{ flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner" />
      {text && <p style={{ color: '#c9a4ac', fontSize: '0.875rem' }}>{text}</p>}
    </div>
  )
}
