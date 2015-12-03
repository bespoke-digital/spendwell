
import { Link } from 'react-router';


export default (props)=> {
  const { className, varient, raised, ...extraProps } = props;

  let classes = className || '';
  classes += ' mui-btn';
  if (varient)
    classes += ` mui-btn--${varient}`;
  if (raised)
    classes += ` mui-btn--raised`;

  if (props.to)
    return <Link className={classes} {...extraProps}/>;
  else
    return <button className={classes} {...extraProps}/>;
};
