
import { Component } from 'react';
import { browserHistory } from 'react-router';
import reactMixin from 'react-mixin';
import moment from 'moment';

import Card from 'components/card';
import Button from 'components/button';
import Money from 'components/money'

import Transactions from 'collections/transactions';


@reactMixin.decorate(ReactMeteorData)
export default class Account extends Component {
  getMeteorData() {
    const { account } = this.props;
    return {
      transactions: Transactions.find({ account: account._id }).fetch(),
    };
  }

  disable(event) {
    event.stopPropagation();
    Meteor.call('disableAccount', this.props.account, function() {
      console.log('client SUCCESS');
    });
  }

  enable(event) {
    event.stopPropagation();
    Meteor.call('enableAccount', this.props.account, function() {
      console.log('client SUCCESS');
    });
  }

  render() {
    const { transactions } = this.data;
    const { selected, account, onClick } = this.props;

    return (
      <Card expanded={selected} onClick={onClick} className='account'>
        <div className='summary'>
          <div>
            {account.name}
          </div>
          <div>
            {/*${account.balance.current ? account.balance.current : account.balance}*/}
          </div>
        </div>

        {selected ? (
          <div>
            <table className='mui-table'>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction)=> (
                  <tr key={transaction._id}>
                    <td>{transaction.name}</td>
                    <td>{transaction.category}</td>
                    <td>{moment(transaction.date).format('LL')}</td>
                    <td><Money amount={transaction.amount}/></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/*
            <Button onClick={account.enabled ? ::this.disable : ::this.enable}>
              {account.enabled ? 'Disable' : 'Enable'} Account
            </Button>
            */}
            <Button to='/accounts' propagateClick={false}>Close</Button>
          </div>
        ) : null}
      </Card>
    );
  }
}
