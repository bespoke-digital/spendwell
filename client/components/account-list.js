
import { Component } from 'react';
import { browserHistory } from 'react-router';
import Relay from 'react-relay';
import relayContainer from 'relay-decorator';

import CardList from 'components/card-list';

import Account from './account';


@relayContainer({ fragments: {
  institution: ()=> Relay.QL`
    fragment on InstitutionNode {
      accounts(first: 10) {
        edges {
          node {
            id
            ${Account.getFragment('account')}
          }
        }
      }
    }
  `,
} })
export default class AccountList extends Component {
  selectAccount({ id }) {
    browserHistory.push({ pathname: `/accounts/${id}` });
  }

  render() {
    const { institution } = this.props;

    return (
      <div>
        <CardList>
          {institution.accounts.edges.map(({ node })=>
            <Account key={node.id} account={node}/>
          )}
        </CardList>
      </div>
    );
  }
}
