
import { PropTypes } from 'react'

import styles from 'sass/components/static-label.scss'

export default function StaticLabel ({ className, ...props }) {
  return <label className={`${styles.root} ${className}`} {...props}/>
}

StaticLabel.propTypes = {
  className: PropTypes.string,
}
