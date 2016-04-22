
export default function(props) {
  const { className, ..._props } = props;
  return <div className={`container ${className || ''}`} {..._props}/>;
}
