export function safeLocalReturnTo(value: string | null, fallback = '/produtos') {
  if (!value?.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback
  const base = new URL('https://local.invalid')
  const destination = new URL(value, base)
  return destination.origin === base.origin ? `${destination.pathname}${destination.search}${destination.hash}` : fallback
}
