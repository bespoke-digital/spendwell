
import { Component } from 'react';
import moment from 'moment';
import Relay from 'react-relay';

import Card from 'components/card';
import Button from 'components/button';
import Money from 'components/money';
import {
  DisableAccountMutation,
  EnableAccountMutation,
} from 'mutations/accounts';


export default class Account extends Component {
  toggleOpen() {
    const { open } = this.props.relay.variables;
    this.props.relay.setVariables({ open: !open });
  }

  disable() {
    const { account } = this.props;
    Relay.Store.commitUpdate(new DisableAccountMutation({ account }), {
      onSuccess: console.log.bind(console, 'onSuccess'),
      onFailure: console.log.bind(console, 'onFailure'),
    });
  }

  enable() {
    const { account } = this.props;
    Relay.Store.commitUpdate(new EnableAccountMutation({ account }), {
      onSuccess: console.log.bind(console, 'onSuccess'),
      onFailure: console.log.bind(console, 'onFailure'),
    });
  }

  render() {
    const { open } = this.props.relay.variables;
    const { account } = this.props;

    return (
      <Card
        className={`account ${account.disabled ? 'disabled' : ''}`}
        expanded={open}
        summary={
          <div onClick={::this.toggleOpen}>
            <div>
              {account.name}
            </div>
            <div>
              {account.currentBalance ?
                <Money amount={account.currentBalance}/>
              : null}
            </div>
            {!account.disabled ?
              <Button onClick={::this.disable} propagateClick={false}>
                Disable
              </Button>
            :
              <Button onClick={::this.enable} propagateClick={false}>
                Enable
              </Button>
            }
          </div>
        }
      >
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
            {account.transactions.edges.map(({ node })=> (
              <tr key={node.id}>
                <td>{node.description}</td>
                <td>{node.category ? node.category.name : ''}</td>
                <td>{moment(node.date).format('LL')}</td>
                <td><Money amount={node.amount}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
  }
}

Account = Relay.createContainer(Account, {
  initialVariables: {
    open: false,
  },
  fragments: {
    account: ()=> Relay.QL`
      fragment on AccountNode {
        ${DisableAccountMutation.getFragment('account')}
        ${EnableAccountMutation.getFragment('account')}
        id
        name
        currentBalance
        disabled
        transactions(first: 100) @include(if: $open) {
          edges {
            node {
              id
              description
              date
              amount
              category {
                name
              }
            }
          }
        }
      }
    `,
  },
});

export default Account;
