import { useState } from 'react'

export default function CountryFlag({ src, alt, fallbackText, className = '', size = 28 }) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <img
        className={`country-flag ${className}`}
        src={src}
        alt={alt || 'Country flag'}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span className={`country-flag country-flag-fallback ${className}`} aria-label={alt || 'Country flag'}>
      {fallbackText || '🏳️'}
    </span>
  )
}