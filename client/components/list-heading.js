
import styles from 'sass/components/list-heading.scss';


export default function ListHeading({ className, ...props }) {
  return <div className={`${styles.root} ${className}`} {...props}/>;
}
