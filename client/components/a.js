
import { browserHistory } from 'react-router'


export function supressEvent (handler, href, event) {
  if (event)
    event.preventDefault()

  if (handler)
    handler()

  if (href)
    browserHistory.push(href)
}

export default function A ({ onClick, href, ...props }) {
  return <a
    href={href || '#'}
    onClick={supressEvent.bind(null, onClick, href)} {...props}
  />
}
