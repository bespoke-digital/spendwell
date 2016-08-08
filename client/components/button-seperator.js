
import { PropTypes } from 'react'

import styles from 'sass/components/button-seperator.scss'

export default function ButtonSeperator ({ className, ...props }) {
  return <div className={`${styles.root} ${className || ''}`} {...props}/>
}

ButtonSeperator.propTypes = {
  className: PropTypes.string,
}
