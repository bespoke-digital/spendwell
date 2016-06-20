
export function parseUrl (url) {
  const a = document.createElement('a')
  a.href = url
  const { protocol, host, hostname, port, pathname, hash, search } = a
  return { protocol, host, hostname, port, pathname, hash, search }
}
