
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import Button from 'components/button';
import Institution from 'components/institution';

import { SyncInstitutionsMutation } from 'mutations/institutions';

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

  render() {
    const { viewer: { institutions } } = this.props;

    return (
      <div className={`container ${styles.root}`}>
        <div className='heading'>
          <h1>Accounts</h1>
        </div>

        {institutions.edges.map(({ node })=>
          <Institution key={node.id} institution={node}/>
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
    );
  }
}

OnboardingAccounts = Relay.createContainer(OnboardingAccounts, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${SyncInstitutionsMutation.getFragment('viewer')}
        institutions(first: 10) {
          edges {
            node {
              ${Institution.getFragment('institution')}
              id
            }
          }
        }
      }
    `,
  },
});

export default OnboardingAccounts;

