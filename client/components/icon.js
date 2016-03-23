
export default function({ type, fixedWidth, className, ...props }) {
  return <i className={`
    icon icon-${type}
    fa fa-${type}
    ${fixedWidth ? 'fa-fw' : ''}
    ${className ? className : ''}
  `} {...props}/>;
}
