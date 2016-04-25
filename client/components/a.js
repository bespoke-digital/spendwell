
export function supressEvent(handler, event) {
  if (event)
    event.preventDefault();

  if (handler)
    handler();
}

export default function A({ onClick, ...props }) {
  return <a href='#' onClick={supressEvent.bind(null, onClick)} {...props}/>;
}
