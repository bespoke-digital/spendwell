
export default function({ type, fixedWidth, className, ...props }) {
  return <i className={`
    fa
    fa-${type}
    ${fixedWidth ? 'fa-fw' : ''}
    ${className ? className : ''}
  `} {...props}/>;
}
