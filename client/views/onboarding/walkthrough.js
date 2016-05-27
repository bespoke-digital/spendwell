
import { Component } from 'react';
import Relay from 'react-relay';

import { handleMutationError } from 'utils/network-layer';
import Button from 'components/button';
import Onboarding from 'components/onboarding';
import Graphicdialog from 'components/graphic-dialog';
import Icon from 'components/icon';

import { SyncInstitutionsMutation } from 'mutations/institutions';
import track from 'utils/track';

import pyfImage from 'img/views/onboarding/pyf.svg';
import liveImage from 'img/views/onboarding/live.svg';
import philosophyImage from 'img/views/onboarding/philosophy.svg';
import crunchingImage from 'img/views/onboarding/crunching.svg';
import readyImage from 'img/views/onboarding/ready.svg';


const STEPS = [
  {
    scheme: 'cyan',
    image: philosophyImage,
    header: 'Our Philosophy',
    paragraph: `
      While we analyze your data, we want to quickly tell you a bit more about
      our philosophy. It boils down to two key principals: pay yourself first
      and live within your means.
    `,
  },
  {
    scheme: 'dark-blue',
    image: pyfImage,
    header: 'Pay Yourself First',
    paragraph: `
      This means taking money for your savings goals out first, before anything
      else. When you set up a goal, the amount is subtracted from your safe to
      spend number each month.
    `,
  },
  {
    scheme: 'orange',
    image: liveImage,
    header: 'Live Within Your Means',
    paragraph: `
      This one seems obvious, but can be hard in practice. We will help by
      telling you what's safe to spend while ensuring your goals and bills are
      accounted for.
    `,
  },
  {
    syncing: {
      scheme: 'purple',
      image: crunchingImage,
      header: 'We\'re Crunching The Numbers',
      paragraph: `
        We're downloading and processing your financial data. It could take a
        minute or two. We’ll be estimating your income and detecting some of
        your bills in the process.
      `,
    },
    doneSyncing: {
      scheme: 'blue',
      image: readyImage,
      header: 'Your Data Is Ready To Go',
      paragraph: `
        You’ll now be redirected to your financial dashboard where all the magic
        happens. Review the bills we’ve created, set up some goals and labels
        and start managing your money like a boss.
      `,
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

    track('onboard-walkthrough');

    this.setState({ syncing: true });
    Relay.Store.commitUpdate(new SyncInstitutionsMutation({ viewer }), {
      onFailure: (response)=> {
        this.setState({ syncing: false });
        handleMutationError(response);
      },
      onSuccess: ()=> {
        console.log('Success: SyncInstitutionsMutation');
        this.setState({ syncing: false });
        track('onboard-sync');
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
        <Graphicdialog
          scheme={step.scheme}
          gif={step.gif}
          image={step.image}
          header={step.header}
          paragraph={step.paragraph}
          prev={stepIndex > 0 ?
            <Button fab onClick={()=> this.setState({ stepIndex: stepIndex - 1 })}>
              <Icon type='arrow back'/>
            </Button>
          : null}
          next={stepIndex === STEPS.length - 1 ?
            <Button
              to='/app/dashboard'
              disabled={syncing}
              loading={syncing}
              fab
            >
              <Icon type='done'/>
            </Button>
          :
            <Button fab onClick={()=> this.setState({ stepIndex: stepIndex + 1 })}>
              <Icon type='arrow forward'/>
            </Button>
          }
        />
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
