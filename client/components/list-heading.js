
import styles from 'sass/components/list-heading.scss'


export default function ListHeading ({ className, ...props }) {
  return <h2 className={`${styles.root} ${className}`} {...props}/>
}
