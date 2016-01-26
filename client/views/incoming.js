
import { Component, PropTypes } from 'react';

import Button from 'components/button';
import TransactionList from 'components/transaction-list';

import styles from 'sass/views/bucket.scss';


const INCOMING_FILTER = {
  type: 'hidden',
  amount: { $gt: 0 },
  transfer: false,
};


export default class Incoming extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <div className={`container ${styles.root}`}>
        <div className='heading'>
          <Button onClick={()=> this.props.history.goBack()} className='back'>
            <i className='fa fa-long-arrow-left'/>
          </Button>

          <h1>Incoming</h1>
        </div>

        <TransactionList filters={[INCOMING_FILTER]} editFilters={false}/>
      </div>
    );
  }
}
