
import _ from 'lodash';
import { Component } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import Button from 'components/button';
import Onboarding from 'components/onboarding';
import CardList from 'components/card-list';
import Card from 'components/card';
import Money from 'components/money';

import { SyncInstitutionsMutation } from 'mutations/institutions';
import { DisableAccountMutation, EnableAccountMutation } from 'mutations/accounts';

import eventEmitter from 'utils/event-emitter';

import bankImage from 'img/views/onboarding/bank.svg';
import styles from 'sass/views/accounts';


class OnboardingAccounts extends Component {
  continue() {
    const { viewer } = this.props;

    Relay.Store.commitUpdate(new SyncInstitutionsMutation({ viewer }), {
      onFailure: ()=> console.log('Failure: SyncInstitutionsMutation'),
      onSuccess: ()=> {
        eventEmitter.emit('sync-complete');
        console.log('Success: SyncInstitutionsMutation');
      },
    });

    browserHistory.push('/onboarding/walkthrough');
  }

  disable(account) {
    Relay.Store.commitUpdate(new DisableAccountMutation({ account }), {
      onFailure: ()=> console.log('Failure: DisableAccountMutation'),
      onSuccess: ()=> console.log('Success: DisableAccountMutation'),
    });
  }

  enable(account) {
    Relay.Store.commitUpdate(new EnableAccountMutation({ account }), {
      onFailure: ()=> console.log('Failure: EnableAccountMutation'),
      onSuccess: ()=> console.log('Success: EnableAccountMutation'),
    });
  }

  orderedAccounts(institution) {
    return _.sortBy(institution.accounts.edges.map(({ node })=> node), 'disabled');
  }

  render() {
    const { viewer } = this.props;

    return (
      <Onboarding viewer={viewer}>
        <div className={`container skinny ${styles.root}`}>
          <div className='heading'>
            <h1>Bank Accounts</h1>
          </div>

          <CardList>
            <Card className='help'>
              <img src={bankImage}/>
              <h3>Your bank has been succesfully connected!</h3>
              <p>You can disable any of your accounts below, or just continue.</p>
              <div className='clearfix'/>
            </Card>
          </CardList>

          {viewer.institutions.edges.map(({ node })=>
            <CardList className='institution' key={node.id}>
              <Card summary={<div><h3>{node.name}</h3></div>}/>

              {this.orderedAccounts(node).map((account)=>
                <Card key={account.id} className={`account ${account.disabled ? 'disabled' : ''}`} summary={
                  <div>
                    <div>{account.name}</div>
                    <div><Money amount={account.currentBalance}/></div>
                    <Button onClick={account.disabled ?
                      this.enable.bind(this, account) :
                      this.disable.bind(this, account)
                    }>
                      {account.disabled ? 'Enable' : 'Disable'}
                    </Button>
                  </div>
                }/>
              )}
            </CardList>
          )}

          <div className='flex-row'>
            <div/>
            <Button to='/onboarding/connect' flat>Add Another</Button>
            <Button variant='primary' onClick={::this.continue}>
              Next
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
                    ${EnableAccountMutation.getFragment('account')}

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

