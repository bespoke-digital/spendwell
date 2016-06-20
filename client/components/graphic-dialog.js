
import { PropTypes } from 'react'

import Dialog from 'components/dialog'

import styles from 'sass/components/graphic-dialog.scss'

export default function GraphicDialog (props) {
  const {
      scheme,
      image,
      header,
      paragraph,
      next,
      prev,
      onRequestClose,
      className,
  } = props

  return (
    <Dialog
      className={`${styles.root} scheme-${scheme} ${className || ''}`}
      onRequestClose={onRequestClose}
      size={null}
    >
      <div className='image'>
        <img src={image}/>
      </div>

      <div className='copy'>
        <h3>{header}</h3>
        <p>{paragraph}</p>
      </div>

      <div className='control-prev'>{prev || null}</div>
      <div className='control-next'>{next || null}</div>
    </Dialog>
  )
}

GraphicDialog.propTypes = {
  scheme: PropTypes.string,
  image: PropTypes.string,
  header: PropTypes.string,
  paragraph: PropTypes.string,
  next: PropTypes.object,
  prev: PropTypes.object,
  onRequestClose: PropTypes.func,
  className: PropTypes.string,
}
