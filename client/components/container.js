
import styles from 'sass/components/container.scss'


export default function (props) {
  const { className, ..._props } = props
  return <div className={`${styles.root} ${className || ''}`} {..._props}/>
}
