
import styles from 'sass/components/card-list.scss'


export default ({ className, children }) => (
  <div className={`card-list ${styles.root} ${className ? className : ''}`}>
    {children}
  </div>
)
