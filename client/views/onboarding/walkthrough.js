
import { Component, PropTypes } from 'react'
import Relay from 'react-relay'

import { handleMutationError } from 'utils/network-layer'
import Button from 'components/button'
import Onboarding from 'components/onboarding'
import Graphicdialog from 'components/graphic-dialog'
import Icon from 'components/icon'

import { SyncInstitutionsMutation } from 'mutations/institutions'
import track from 'utils/track'

import pyfImage from 'img/views/onboarding/pyf.svg'
import liveImage from 'img/views/onboarding/live.svg'
import philosophyImage from 'img/views/onboarding/philosophy.svg'
import crunchingImage from 'img/views/onboarding/crunching.svg'
import readyImage from 'img/views/onboarding/ready.svg'


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
        minute or two. If you don't feel like waiting, don't worry. We'll email
        you when the process is complete.
      `,
    },
    doneSyncing: {
      scheme: 'blue',
      image: readyImage,
      header: 'Your Data Is Ready To Go',
      paragraph: `
        You'll now be redirected to your financial dashboard where all the magic
        happens. Review the bills we've created, set up some goals/labels and
        start managing your money like a boss.
      `,
    },
  },
]

class OnboardingWalkthrough extends Component {
  static propTypes = {
    viewer: PropTypes.object,
    relay: PropTypes.object,
  };

  state = {
    stepIndex: 0,
    syncing: true,
  };

  constructor () {
    super()
    this.poll = ::this.poll
  }

  componentDidMount () {
    const { viewer } = this.props

    track('onboard-walkthrough')

    Relay.Store.commitUpdate(new SyncInstitutionsMutation({ viewer }), {
      onFailure: handleMutationError,
      onSuccess: () => console.info('Success: SyncInstitutionsMutation'),
    })

    this.pollTimeout = setInterval(this.poll, 5000)
  }

  poll () {
    const { relay } = this.props
    relay.forceFetch()
  }

  componentWillUnmount () {
    clearInterval(this.pollTimeout)
  }

  render () {
    const { viewer } = this.props
    const { stepIndex } = this.state
    const syncing = !viewer.lastSync

    let step = STEPS[stepIndex]

    if (step.syncing) {
      step = step[syncing ? 'syncing' : 'doneSyncing']
    }

    return (
      <Onboarding viewer={viewer}>
        <Graphicdialog
          scheme={step.scheme}
          gif={step.gif}
          image={step.image}
          header={step.header}
          paragraph={step.paragraph}
          prev={stepIndex > 0 ?
            <Button fab onClick={() => this.setState({ stepIndex: stepIndex - 1 })}>
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
            <Button fab onClick={() => this.setState({ stepIndex: stepIndex + 1 })}>
              <Icon type='arrow forward'/>
            </Button>
          }
        />
      </Onboarding>
    )
  }
}

OnboardingWalkthrough = Relay.createContainer(OnboardingWalkthrough, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${SyncInstitutionsMutation.getFragment('viewer')}
        ${Onboarding.getFragment('viewer')}

        lastSync
      }
    `,
  },
})

export default OnboardingWalkthrough
