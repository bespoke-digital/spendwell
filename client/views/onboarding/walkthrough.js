
import { Component } from 'react';
import Relay from 'react-relay';

import Button from 'components/button';
import Onboarding from 'components/onboarding';
import Card from 'components/card';
import CardList from 'components/card-list';

import { SyncInstitutionsMutation } from 'mutations/institutions';

import goalsImage from 'img/views/dashboard/goals.svg';
import billsImage from 'img/views/dashboard/bills.svg';
import spendingImage from 'img/views/dashboard/spending.svg';

import styles from 'sass/views/onboarding/walkthrough';


const STEPS = [
  {
    content: (
      <Card className='help'>
        <img src={spendingImage}/>
        <h3>Our Philosophy</h3>
        <p>
          While we analyze your data, we want to quickly tell you a bit
          more about our philosophy. It boils down to two key principals:
          {' '}<strong>pay yourself first</strong> and
          {' '}<strong>live within your means</strong>.
        </p>
        <div className='clearfix'/>
      </Card>
    ),
  },
  {
    content: (
      <Card className='help'>
        <img src={goalsImage}/>
        <h3>Pay Yourself First</h3>
        <p>
          This means taking your goals for saving and investing money off the
          top, before anything else. Our <strong>goals</strong> feature can help.
        </p>
        <div className='clearfix'/>
      </Card>
    ),
  },
  {
    content: (
      <Card className='help'>
        <img src={billsImage}/>
        <h3>Live Within Your Means</h3>
        <p>
          This one seems obvious, but can be hard in practice. We can help
          by telling you what's <strong>safe to spend</strong> without
          missing bills or failing to meet your savings goals.
        </p>
        <div className='clearfix'/>
      </Card>
    ),
  },
  {
    syncing: {
      content: (
        <Card>
          <div className='media'>
            <iframe
              src='//giphy.com/embed/2WuHHWbGt3fY4'
              width='100%'
              height='305'
              frameBorder='0'
            />
          </div>
          <h3>We're Crunching The Numbers</h3>
          <p>
            We're downloading and processing your financial data. It could take a
            minute or two. In the meantime, enjoy this gif. It roughly simulates
            the process.
          </p>
        </Card>
      ),
    },
    doneSyncing: {
      content: (
        <Card>
          <div className='media'>
            <iframe
              src='//giphy.com/embed/2WuHHWbGt3fY4'
              width='100%'
              height='305'
              frameBorder='0'
            />
          </div>
        </Card>
      ),
    },
  },
];


class OnboardingWalkthrough extends Component {
  constructor() {
    super();
    this.state = { syncing: false, stepIndex: 0 };
  }

  componentDidMount() {
    const { viewer } = this.props;

    this.setState({ syncing: true });
    Relay.Store.commitUpdate(new SyncInstitutionsMutation({ viewer }), {
      onFailure: ()=> {
        console.log('Failure: SyncInstitutionsMutation');
        this.setState({ syncing: false });
      },
      onSuccess: ()=> {
        console.log('Success: SyncInstitutionsMutation');
        this.setState({ syncing: false });
      },
    });
  }

  render() {
    const { viewer } = this.props;
    const { syncing, stepIndex } = this.state;

    let step = STEPS[stepIndex];

    if (step.syncing)
      step = step[syncing ? 'syncing' : 'doneSyncing'];

    return (
      <Onboarding viewer={viewer}>
        <div className={`container skinny ${styles.root}`}>
          <CardList>
            {step.content}
          </CardList>

          <div className='flex-row'>
            <div/>
            {stepIndex > 0 ?
              <Button
                flat
                onClick={()=> this.setState({ stepIndex: stepIndex - 1 })}
              >
                Previous
              </Button>
            : null}
            {stepIndex === STEPS.length - 1 ?
              <Button
                variant='primary'
                to='/onboarding/income'
                disabled={syncing}
                loading={syncing}
              >
                Next
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
        ${SyncInstitutionsMutation.getFragment('viewer')}
        ${Onboarding.getFragment('viewer')}
      }
    `,
  },
});

export default OnboardingWalkthrough;
