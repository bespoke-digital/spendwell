import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import FinicityAccountDialog from 'components/finicity-account-dialog';
import Dialog from 'components/dialog';
import DialogActions from 'components/dialog-actions';
import Button from 'components/button';

import style from 'sass/components/error-dialog';

class ErrorDialog extends Component {
  static propTypes = {
  onRequestClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
	};

  render() {
    const { onRequestClose , onError} = this.props;

    return (
      <Dialog size='sm' onRequestClose={onRequestClose , onError} className={style.root}>
        <div className='error-body'>
          <h3>Something went wrong</h3>
          <p>Sorry. We’ve let our engineers know. 
          They will fix it up and get things back to normal shortly.</p>
        </div>
        <DialogActions>
          <Button onClick={ onRequestClose , onError}>OK</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default ErrorDialog;
