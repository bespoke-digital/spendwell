
import { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import reactMixin from 'react-mixin';

import CardList from 'components/card-list';

import Accounts from 'collections/accounts';

import Account from './account';


@reactMixin.decorate(ReactMeteorData)
export default class AccountList extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    institution: PropTypes.object.isRequired,
  };

  getMeteorData() {
    const { institution } = this.props;

    return {
      accounts: Accounts.find({
        // enabled: true,
        institution: institution._id,
      }).fetch(),
      disabledAccounts: Accounts.find({
        enabled: false,
        institution: institution._id,
      }).fetch(),
    };
  }

  selectAccount({ _id }) {
    browserHistory.push({ pathname: `/accounts/${_id}` });
  }

  render() {
    const { accounts, disabledAccounts } = this.data;
    const { params } = this.props;

    return (
      <div>
        <CardList>
          {accounts.map((account)=> <Account
            key={account._id}
            account={account}
            selected={params.accountId === account._id}
            onClick={this.selectAccount.bind(this, account)}
          />)}
        </CardList>

        <CardList>
          {disabledAccounts.map((account)=> <Account
            key={account._id}
            account={account}
            selected={params.accountId === account._id}
            onClick={this.selectAccount.bind(this, account)}
          />)}
        </CardList>

      </div>
    );
  }
}
