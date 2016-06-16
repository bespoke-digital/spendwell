
import styles from 'sass/components/dialog-actions.scss'


export default (props) => {
  const { className, ..._props } = props
  return (
    <div className={`dialog-actions ${styles.root} ${className ? className : ''}`} {..._props}/>
  )
}
