
import styles from 'sass/components/card-list.scss';


export default (props)=> (
  <div className={`${styles.root} ${props.className ? props.className : ''}`}>
    {props.children}
  </div>
);
