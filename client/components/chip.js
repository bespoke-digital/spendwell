
import styles from 'sass/components/chip.scss'


export default (props) => {
  const { className, ..._props } = props
  return (
    <div className={`chip ${styles.root} ${className ? className : ''}`} {..._props}/>
  )
}
