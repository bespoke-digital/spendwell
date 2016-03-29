
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

import styles from 'sass/views/accounts';


const STEPS = [
  {
    title: 'Welcome to Spendwell!',
    content: (
      <Card className='help'>
        <img src={spendingImage}/>
        <p>
          While we analyze your data, we want to quickly tell you a bit
          more about our philosophy. It boils down to two principals:
          {' '}<strong>pay yourself first</strong> and
          {' '}<strong>live within your means</strong>. These two
          simple concepts can help make you rich and achieve financial
          freedom. We’re here to show you the way.
        </p>
        <div className='clearfix'/>
      </Card>
    ),
  },
  {
    title: 'Pay Yourself First',
    content: (
      <Card className='help'>
        <img src={goalsImage}/>
        <p>
          Paying yourself first means making your own long-term financial
          well-being your top priority. You set your goals for saving and
          investing money, and we'll make sure it's taken off the top each
          month.
        </p>
        <div className='clearfix'/>
      </Card>
    ),
  },
  {
    title: 'Live Within Your Means',
    content: (
      <Card className='help'>
        <img src={billsImage}/>
        <p>
          After paying yourself, you'll have some money left over. Don't
          spend more than that in a given month. We can help there by
          showing you how much you've spent so far this month, and how much
          you have left to spend across all your accounts and credit cards.
        </p>
        <div className='clearfix'/>
      </Card>
    ),
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
