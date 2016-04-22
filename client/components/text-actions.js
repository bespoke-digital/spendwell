
import styles from 'sass/components/text-actions.scss';


export default (props)=> {
  const { className, ..._props } = props;
  return (
    <div className={`${styles.root} ${className ? className : ''}`} {..._props}/>
  );
};
