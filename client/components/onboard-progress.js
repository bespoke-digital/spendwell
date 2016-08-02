
import _ from 'lodash'
import { Component, PropTypes } from 'react'
import Relay from 'react-relay'
import { browserHistory } from 'react-router'

import Progress from 'components/progress'
import Icon from 'components/icon'
import Transition from 'components/transition'
import ClickOff from 'components/click-off'
import IncomeEstimateDialog from 'components/income-estimate-dialog'
import CreateBucketSheet from 'components/create-bucket-sheet'

import eventEmitter from 'utils/event-emitter'
import style from 'sass/components/onboard-progress'


class OnboardProgress extends Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
  };

  state = {
    todosOpen: false,
    calloutOpen: true,
    showIncomeEstimateDialog: false,
    createLabel: false,
    createBill: false,
    createGoal: false,
    createAccount: false,
  };

  render () {
    const { viewer } = this.props
    const {
      todosOpen,
      calloutOpen,
      showIncomeEstimateDialog,
      createLabel,
      createBill,
      createGoal,
    } = this.state

    const status = {
      hasInstitution: viewer.institutions.edges.length > 0,
      estimatedIncomeConfirmed: viewer.settings.estimatedIncomeConfirmed,
      hasGoal: viewer.goals.edges.length > 0,
      hasBill: viewer.bills.edges.length > 0,
      hasLabel: viewer.labels.edges.length > 0,
    }

    const progressTarget = Object.keys(status).length
    const progressCurrent = _.values(status).filter((v) => v).length

    if (progressTarget === progressCurrent) {
      return null
    }

    return (
      <div className={style.root}>
        <div
          className='appbar-container'
          onClick={() => this.setState({ todosOpen: !todosOpen,
            calloutOpen: false })}
        >
          <Progress current={progressCurrent + 1} target={progressTarget + 1}/>
        </div>

        <Transition show={calloutOpen && progressCurrent <= 2}>
          <ClickOff
            className='callout'
            onClickOff={() => this.setState({ calloutOpen: false })}
          >
            <h4>Get Started</h4>
          </ClickOff>
        </Transition>

        <Transition show={todosOpen}>
          <ClickOff
            className='todos'
            onClickOff={() => this.setState({ todosOpen: false })}
          >
            <h4>Get Started</h4>
            <ul>
              <li
                className={status.hasInstitution ? 'done' : 'not-done'}
                onClick={() => browserHistory.push('/app/accounts')}
              >
                <div><Icon type={status.hasInstitution ? 'done' : 'radio button off'}/></div>
                <div>
                  <div className='title'>Connect an Account</div>
                  <div className='description'>Get your transaction in the system.</div>
                </div>
              </li>
              <li
                className={status.estimatedIncomeConfirmed ? 'done' : 'not-done'}
                onClick={() => this.setState({ showIncomeEstimateDialog: true })}
              >
                <div><Icon type={status.estimatedIncomeConfirmed ? 'done' : 'radio button off'}/></div>
                <div>
                  <div className='title'>Confirm Income Estimate</div>
                  <div className='description'>Ensure we calculated your monthly income correctly.</div>
                </div>
              </li>
              <li
                className={status.hasGoal ? 'done' : 'not-done'}
                onClick={() => this.setState({ createGoal: true })}
              >
                <div><Icon type={status.hasGoal ? 'done' : 'radio button off'}/></div>
                <div>
                  <div className='title'>Create a Goal</div>
                  <div className='description'>For long and short term savings.</div>
                </div>
              </li>
              <li
                className={status.hasBill ? 'done' : 'not-done'}
                onClick={() => this.setState({ createBill: true })}
              >
                <div><Icon type={status.hasBill ? 'done' : 'radio button off'}/></div>
                <div>
                  <div className='title'>Create a Bill</div>
                  <div className='description'>For monthly recurring expenses.</div>
                </div>
              </li>
              <li
                className={status.hasLabel ? 'done' : 'not-done'}
                onClick={() => this.setState({ createLabel: true })}
              >
                <div><Icon type={status.hasLabel ? 'done' : 'radio button off'}/></div>
                <div>
                  <div className='title'>Create a Label</div>
                  <div className='description'>For non-recurring expenses.</div>
                </div>
              </li>
            </ul>
          </ClickOff>
        </Transition>

        <Transition show={showIncomeEstimateDialog}>
          <IncomeEstimateDialog
            viewer={viewer}
            onRequestClose={() => this.setState({ showIncomeEstimateDialog: false })}
          />
        </Transition>

        <CreateBucketSheet
          visible={createLabel}
          onRequestClose={() => this.setState({ createLabel: false })}
          onComplete={() => eventEmitter.emit('forceFetch')}
          type='expense'
          viewer={viewer}
        />

        <CreateBucketSheet
          visible={createBill}
          onRequestClose={() => this.setState({ createBill: false })}
          onComplete={() => eventEmitter.emit('forceFetch')}
          type='bill'
          viewer={viewer}
        />

        <CreateBucketSheet
          visible={createGoal}
          onRequestClose={() => this.setState({ createGoal: false })}
          onComplete={() => eventEmitter.emit('forceFetch')}
          type='goal'
          viewer={viewer}
        />
      </div>
    )
  }
}

OnboardProgress = Relay.createContainer(OnboardProgress, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${IncomeEstimateDialog.getFragment('viewer')}
        ${CreateBucketSheet.getFragment('viewer')}

        settings {
          estimatedIncomeConfirmed
        }

        institutions(first: 1) {
          edges { node { id } }
        }

        goals: buckets(first: 1, type: "goal") {
          edges { node { id } }
        }

        bills: buckets(first: 1, type: "bill") {
          edges { node { id } }
        }

        labels: buckets(first: 1, type: "expense") {
          edges { node { id } }
        }
      }
    `,
  },
})

export default OnboardProgress
