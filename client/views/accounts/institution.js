
import { Component } from 'react';
import { browserHistory } from 'react-router';
import Relay from 'react-relay';
import moment from 'moment';

import CardList from 'components/card-list';
import Card from 'components/card';
import Button from 'components/button';
import { SyncInstitutionMutation } from 'mutations/institutions';

import Account from './account';


class Institution extends Component {
  selectAccount({ id }) {
    browserHistory.push({ pathname: `/accounts/${id}` });
  }

  sync() {
    const { institution } = this.props;
    Relay.Store.commitUpdate(new SyncInstitutionMutation({ institution }), {
      onSuccess: console.log.bind(console, 'onSuccess'),
      onFailure: console.log.bind(console, 'onFailure'),
    });
  }

  render() {
    const { institution } = this.props;

    return (
      <div>
        <Card>
          <div className='summary'>
            <h3>{institution.name}</h3>
            { institution.canSync ?
              <div>
                <span className='last-sync'>
                  {moment(institution.lastSync).fromNow()}
                </span>
                <Button onClick={::this.sync}><i className='fa fa-refresh'/></Button>
              </div>
            : null}
          </div>
        </Card>
        <CardList>
          {institution.accounts.edges.map(({ node })=>
            <Account key={node.id} account={node}/>
          )}
        </CardList>
      </div>
    );
  }
}

Institution = Relay.createContainer(Institution, {
  fragments: {
    institution: ()=> Relay.QL`
      fragment on InstitutionNode {
        ${SyncInstitutionMutation.getFragment('institution')}
        name
        canSync
        lastSync
        accounts(first: 10) {
          edges {
            node {
              ${Account.getFragment('account')}
              id
            }
          }
        }
      }
    `,
  },
});

export default Institution;
