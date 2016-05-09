
import styles from 'sass/components/icon-list.scss';


export default (props)=> {
  const { className, ..._props } = props;
  return (
    <div className={`icon-list ${styles.root} ${className ? className : ''}`} {..._props}/>
  );
};
