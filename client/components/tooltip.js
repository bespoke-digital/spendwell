
import styles from 'sass/components/tooltip.scss'


export default (props) => {
  const { className, ..._props } = props
  return (
    <div className={`tooltip ${styles.root} ${className ? className : ''}`} {..._props}/>
  )
}
