
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Button from 'components/button';
import TransactionList from 'components/transaction-list';

import styles from 'sass/views/bucket.scss';


class Outgoing extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  };

  render() {
    const { viewer } = this.props;
    return (
      <div className={`container ${styles.root}`}>

        <div className='heading'>
          <Button to='/app/' className='back'>
            <i className='fa fa-long-arrow-left'/>
          </Button>

          <h1>Outgoing</h1>
        </div>

        <TransactionList transactions={viewer.transactions}/>
      </div>
    );
  }
}

Outgoing = Relay.createContainer(Outgoing, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        transactions(first: 1000, amountLt: 0, isTransfer: false) {
          ${TransactionList.getFragment('transactions')}
        }
      }
    `,
  },
});

export default Outgoing;

