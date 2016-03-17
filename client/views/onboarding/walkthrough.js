
import { Component } from 'react';
import Relay from 'react-relay';

import Button from 'components/button';
import Onboarding from 'components/onboarding';
import Card from 'components/card';
import CardList from 'components/card-list';

import eventEmitter from 'utils/event-emitter';

import styles from 'sass/views/accounts';


class OnboardingWalkthrough extends Component {
  constructor() {
    super();
    this.onSyncComplete = ::this.onSyncComplete;
    this.state = { syncing: true };
  }

  componentDidMount() {
    eventEmitter.addListener('sync-complete', this.onSyncComplete);
  }

  componentWillUnmount() {
    eventEmitter.removeListener('sync-complete', this.onSyncComplete);
  }

  onSyncComplete() {
    this.setState({ syncing: false });
  }

  render() {
    const { viewer } = this.props;
    const { syncing } = this.state;

    return (
      <Onboarding viewer={viewer}>
        <div className={`container ${styles.root}`}>
          <div className='heading'>
            <h1>Some info probably</h1>
          </div>

          <CardList>
            <Card/>
          </CardList>

          <div className='flex-row'>
            <div/>
            <Button
              variant='primary'
              href='/app/dashboard'
              disabled={syncing}
              loading={syncing}
            >
              Continue
            </Button>
          </div>
        </div>
      </Onboarding>
    );
  }
}

OnboardingWalkthrough = Relay.createContainer(OnboardingWalkthrough, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${Onboarding.getFragment('viewer')}
      }
    `,
  },
});

export default OnboardingWalkthrough;
