/** First two characters of a witness name for compact labels (e.g. Derge → DE). */
export function getWitnessInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const two = trimmed.slice(0, 2)
  if (/^[a-zA-Z]/.test(two)) {
    return two.toUpperCase()
  }
  return two
}

export function formatWitnessGroupLabel(names: string[]): string {
  return names.map(getWitnessInitials).join(', ')
}
