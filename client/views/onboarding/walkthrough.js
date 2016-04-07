
import { Component } from 'react';
import Relay from 'react-relay';

import Button from 'components/button';
import Onboarding from 'components/onboarding';
import GraphicCard from 'components/graphic-card';
import Icon from 'components/icon';

import { SyncInstitutionsMutation } from 'mutations/institutions';

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
      While we analyze your data, we want to quickly tell you a bit
      more about our philosophy. It boils down to two key principals:
      pay yourself first and live within your means.
    `,
  },
  {
    scheme: 'dark-blue',
    image: pyfImage,
    header: 'Pay Yourself First',
    paragraph: `
      This means taking money for your savings goals off the
      top, before anything else. Our goals feature can help.
    `,
  },
  {
    scheme: 'orange',
    image: liveImage,
    header: 'Live Within Your Means',
    paragraph: `
      This one seems obvious, but can be hard in practice. We can help
      by telling you what's safe to spend without
      missing bills or failing to meet your savings goals.
    `,
  },
  {
    syncing: {
      scheme: 'purple',
      image: crunchingImage,
      header: 'We\'re Crunching The Numbers',
      paragraph: `
        We're downloading and processing your financial data.
        It could take a minute or two.
      `,
    },
    doneSyncing: {
      scheme: 'blue',
      image: readyImage,
      header: 'You\'re Data Is Ready To Go',
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
        <GraphicCard
          scheme={step.scheme}
          gif={step.gif}
          image={step.image}
          header={step.header}
          paragraph={step.paragraph}
          prev={stepIndex > 0 ?
            <Button fab onClick={()=> this.setState({ stepIndex: stepIndex - 1 })}>
              <Icon type='arrow-left'/>
            </Button>
          : null}
          next={stepIndex === STEPS.length - 1 ?
            <Button
              fab
              to='/onboarding/income'
              disabled={syncing}
              loading={syncing}
            >
              <Icon type='arrow-right'/>
            </Button>
          :
            <Button fab flat onClick={()=> this.setState({ stepIndex: stepIndex + 1 })}>
              <Icon type='arrow-right'/>
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
