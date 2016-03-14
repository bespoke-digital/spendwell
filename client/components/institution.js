
import { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import Relay from 'react-relay';
import moment from 'moment';

import Money from 'components/money';
import CardList from 'components/card-list';
import Card from 'components/card';
import SuperCard from 'components/super-card';
import Button from 'components/button';
import ListAccount from 'components/list-account';

import { SyncInstitutionMutation } from 'mutations/institutions';
import { EnableAccountMutation } from 'mutations/accounts';


class Institution extends Component {
  static propTypes = {
    isAdmin: PropTypes.bool,
  };

  static defaultProps = {
    isAdmin: false,
  };

  constructor() {
    super();
    this.state = { selected: null, showDisabled: false };
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

  enableAccount(account) {
    Relay.Store.commitUpdate(new EnableAccountMutation({ account }), {
      onFailure: ()=> console.log('Failure: EnableAccountMutation'),
      onSuccess: ()=> console.log('Success: EnableAccountMutation'),
    });
  }

  render() {
    const { institution, isAdmin } = this.props;
    const { selected, showDisabled } = this.state;

    return (
      <CardList className='institution'>
        <Card summary={
          <div>
            <h3>{institution.name}</h3>

            { institution.canSync && isAdmin ? [
              <div key='last-sync' className='last-sync'>
                {moment(institution.lastSync).fromNow()}
              </div>,
              <div key='sync'>
                <Button onClick={::this.sync}><i className='fa fa-refresh'/></Button>
              </div>,
            ] : null}
          </div>
        }/>

        {institution.accounts.edges.map(({ node })=>
          <ListAccount
            key={node.id}
            account={node}
            expanded={selected === node.id}
            onClick={()=> selected === node.id ?
              this.setState({ selected: null }) :
              this.setState({ selected: node.id })}
          />
        )}

        <Card summary={
          <div>
            <div><strong>Subtotal</strong></div>
            <div><Money amount={institution.currentBalance}/></div>
          </div>
        }/>

        {institution.disabledAccounts && institution.disabledAccounts.edges.length ?
          <SuperCard
            onSummaryClick={()=> this.setState({ showDisabled: !showDisabled })}
            expanded={showDisabled}
            summary={<Card>Disabled Accounts</Card>}
            className='disabled'
          >
            {institution.disabledAccounts.edges.map(({ node })=>
              <Card key={node.id} className='account' summary={
                <div>
                  <div>{node.name}</div>
                  <Button onClick={this.enableAccount.bind(this, node)}>
                    Enable
                  </Button>
                </div>
              }/>
            )}
          </SuperCard>
        : null}
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
        currentBalance

        accounts(first: 100, disabled: false) {
          edges {
            node {
              ${ListAccount.getFragment('account')}

              id
            }
          }
        }

        disabledAccounts: accounts(first: 100, disabled: true) {
          edges {
            node {
              ${EnableAccountMutation.getFragment('account')}

              id
              name
            }
          }
        }
      }
    `,
  },
});

export default Institution;
