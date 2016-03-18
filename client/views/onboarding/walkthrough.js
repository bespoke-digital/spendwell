
import { Component } from 'react';
import Relay from 'react-relay';

import Button from 'components/button';
import Onboarding from 'components/onboarding';
import Card from 'components/card';
import CardList from 'components/card-list';

import eventEmitter from 'utils/event-emitter';

import styles from 'sass/views/accounts';


const STEPS = [
  {
    title: 'Welcome to Spendwell!',
    content: (
      <Card>
        While we analyze your data, we want to quickly tell you a bit
        more about our philosophy. It boils down to two principals:
        {' '}<strong>pay yourself first</strong> and
        {' '}<strong>live within your means</strong>. These two
        simple concepts can help make you rich and achieve financial
        freedom. We’re here to show you the way.
      </Card>
    ),
  },
  {
    title: 'Pay Yourself First',
    content: (
      <Card>
        Paying yourself first means making your own long-term financial
        well-being your top priority. You set your goals for saving and
        investing money, and we'll make sure it's taken off the top each
        month.
      </Card>
    ),
  },
  {
    title: 'Live Within Your Means',
    content: (
      <Card>
        After paying yourself, you'll have some money left over. Don't
        spend more then that in a given month. We can help there by
        showing you how much you've spent so far this month, and how much
        you have left to spend across all your accounts and credit cards.
      </Card>
    ),
  },
];


class OnboardingWalkthrough extends Component {
  constructor() {
    super();
    this.onSyncComplete = ::this.onSyncComplete;
    this.state = { syncing: true, stepIndex: 0 };
  }

  componentDidMount() {
    eventEmitter.addListener('sync-complete', this.onSyncComplete);
    this.timeout = setTimeout(this.onSyncComplete, 10000);
  }

  componentWillUnmount() {
    eventEmitter.removeListener('sync-complete', this.onSyncComplete);
    clearTimeout(this.timeout);
  }

  onSyncComplete() {
    this.setState({ syncing: false });
  }

  render() {
    const { viewer } = this.props;
    const { syncing, stepIndex } = this.state;

    const step = STEPS[stepIndex];

    return (
      <Onboarding viewer={viewer}>
        <div className={`container skinny ${styles.root}`}>
          <div className='heading'>
            <h1>{step.title}</h1>
          </div>

          <CardList>
            {step.content}
          </CardList>

          <div className='flex-row'>
            <div/>
            {stepIndex === STEPS.length - 1 ?
              <Button
                variant='primary'
                to='/onboarding/income'
                disabled={syncing}
                loading={syncing}
              >
                Continue
              </Button>
            :
              <Button
                variant='primary'
                onClick={()=> this.setState({ stepIndex: stepIndex + 1 })}
              >
                Next
              </Button>
            }
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
