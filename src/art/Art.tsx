interface ArtProps {
  art: string
  className?: string
}

/**
 * Renders a picture at the size of its container: an emoji, `txt:` letters or words in the
 * reading font, or `pair:<a> <b>` — two letters side by side, as on the copying worksheet.
 */
export function Art({ art, className = '' }: ArtProps) {
  if (art.startsWith('txt:')) {
    return (
      <span className={`art art-text ${className}`} aria-hidden="true" dir="rtl">
        {art.slice(4)}
      </span>
    )
  }

  if (art.startsWith('pair:')) {
    const [first, second] = art.slice(5).split(' ')
    return (
      <span className={`art art-pair ${className}`} aria-hidden="true" dir="rtl">
        <span className="pair-letter">{first}</span>
        <span className="pair-letter">{second}</span>
      </span>
    )
  }

  return (
    <span className={`art art-emoji ${className}`} aria-hidden="true">
      {art}
    </span>
  )
}
