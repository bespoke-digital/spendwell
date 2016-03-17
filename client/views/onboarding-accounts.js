
import { Component } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import Button from 'components/button';
import Onboarding from 'components/onboarding';
import CardList from 'components/card-list';
import Card from 'components/card';
import Money from 'components/money';

import { SyncInstitutionsMutation } from 'mutations/institutions';
import { DisableAccountMutation } from 'mutations/accounts';

import styles from 'sass/views/accounts';


class OnboardingAccounts extends Component {
  continue() {
    const { viewer } = this.props;

    Relay.Store.commitUpdate(new SyncInstitutionsMutation({ viewer }), {
      onSuccess: ()=> console.log('Success: SyncInstitutionsMutation'),
      onFailure: ()=> console.log('Failure: SyncInstitutionsMutation'),
    });

    browserHistory.push('/onboarding/walkthrough');
  }

  disable() {
    const { account } = this.props;
    Relay.Store.commitUpdate(new DisableAccountMutation({ account }), {
      onFailure: ()=> console.log('Failure: DisableAccountMutation'),
      onSuccess: ()=> console.log('Success: DisableAccountMutation'),
    });
  }

  render() {
    const { viewer } = this.props;

    return (
      <Onboarding viewer={viewer}>
        <div className={`container ${styles.root}`}>
          <div className='heading'>
            <h1>Accounts</h1>
          </div>

          {viewer.institutions.edges.map(({ node })=>
            <CardList className='institution' key={node.id}>
              <Card summary={<div><h3>{node.name}</h3></div>}/>

              {node.accounts.edges.map(({ node })=>
                <Card key={node.id} summary={
                  <div>
                    <div>{node.name}</div>
                    <div><Money amount={node.currentBalance}/></div>
                    <Button>{node.disabled ? 'Enable' : 'Disable'}</Button>
                  </div>
                }/>
              )}
            </CardList>
          )}

          <div className='flex-row'>
            <div/>
            <Button to='/onboarding/connect'>
              <i className='fa fa-plus'/>
              {' Add Another'}
            </Button>
            <Button variant='primary' onClick={::this.continue}>
              Continue
            </Button>
          </div>
        </div>
      </Onboarding>
    );
  }
}

OnboardingAccounts = Relay.createContainer(OnboardingAccounts, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${Onboarding.getFragment('viewer')}
        ${SyncInstitutionsMutation.getFragment('viewer')}

        institutions(first: 10) {
          edges {
            node {
              id
              name
              currentBalance

              accounts(first: 100) {
                edges {
                  node {
                    ${DisableAccountMutation.getFragment('account')}

                    id
                    name
                    currentBalance
                    disabled
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
});

export default OnboardingAccounts;

