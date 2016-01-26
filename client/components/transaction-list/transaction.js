
import { Component, PropTypes } from 'react';
import moment from 'moment';
import reactMixin from 'react-mixin';

import Card from 'components/card';
import Money from 'components/money';


@reactMixin.decorate(ReactMeteorData)
export default class Transaction extends Component {
  static propTypes = {
    transaction: PropTypes.object.isRequired,
  };

  getMeteorData() {
    return {
      category: this.props.transaction.category(),
    };
  }

  render() {
    const { transaction } = this.props;
    const { category } = this.data;

    return (
      <Card key={transaction.id} className='transaction'>
        <div className='summary'>
          <div className='name'>
            {transaction.name}
          </div>
          <div className='category'>
            {category ? category.name : null}
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
