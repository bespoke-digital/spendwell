
import _ from 'lodash';
import { Component } from 'react';
import { browserHistory } from 'react-router';
import Relay from 'react-relay';
import moment from 'moment';

import CardList from 'components/card-list';
import Card from 'components/card';
import Button from 'components/button';
import ListAccount from 'components/list-account';

import { SyncInstitutionMutation } from 'mutations/institutions';


class Institution extends Component {
  constructor() {
    super();
    this.state = { selected: null };
  }

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
    const { selected } = this.state;

    return (
      <CardList className='institution'>
        <Card summary={
          <div>
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
        }/>
        {_.sortBy(institution.accounts.edges, ({ node })=> node.disabled).map(({ node })=>
          <ListAccount
            key={node.id}
            account={node}
            expanded={selected === node.id}
            onClick={()=> selected === node.id ?
              this.setState({ selected: null }) :
              this.setState({ selected: node.id })}
          />
        )}
      </CardList>
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
        accounts(first: 100) {
          edges {
            node {
              ${ListAccount.getFragment('account')}
              id
              disabled
            }
          }
        }
      }
    `,
  },
});

export default Institution;
