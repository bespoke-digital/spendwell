
import styles from 'sass/components/page-heading.scss'


export default function PageHeading ({ className, ...props }) {
  return <div className={`${styles.root} ${className}`} {...props}/>
}
