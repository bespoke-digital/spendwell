
import styles from 'sass/components/card-actions.scss'


export default (props) => {
  const { className, ..._props } = props
  return (
    <div className={`card-actions ${styles.root} ${className ? className : ''}`} {..._props}/>
  )
}
