import { Component, PropTypes } from 'react'

import Dialog from 'components/dialog'
import DialogActions from 'components/dialog-actions'
import Button from 'components/button'

import style from 'sass/components/finicity-error-dialog'

class ErrorDialog extends Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
  };

  render () {
    const { onRequestClose } = this.props

    return (
      <Dialog size='sm' onRequestClose={onRequestClose} className={style.root}>
        <div className='body'>
          <h3>Something went wrong</h3>
          <p>
            Sorry. We’ve let our engineers know. They will fix it up and get
            things back to normal shortly.
          </p>
        </div>
        <DialogActions>
          <Button onClick={onRequestClose}>OK</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default ErrorDialog
