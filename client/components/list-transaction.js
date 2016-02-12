
import { Component } from 'react';
import moment from 'moment';
import Relay from 'react-relay';

import Card from 'components/card';
import Money from 'components/money';


class ListTransaction extends Component {
  render() {
    const { transaction } = this.props;

    return (
      <Card className='transaction'>
        <div className='summary'>
          <div className='name'>
            {transaction.description}
          </div>
          <div className='category'>
            {transaction.category ? transaction.category.name : null}
          </div>
          <div className='date'>
            {moment(transaction.date).format('Do')}
          </div>
          <div className='amount'>
            <Money amount={transaction.amount} abs={true}/>
          </div>
        </div>
      </Card>
    );
  }
}

ListTransaction = Relay.createContainer(ListTransaction, {
  fragments: {
    transaction: ()=> Relay.QL`
      fragment on TransactionNode {
        description
        amount
        date
        category {
          name
        }
      }
    `,
  },
});

export default ListTransaction;
