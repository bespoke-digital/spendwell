
import _ from 'lodash';
import { Component } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import Progress from 'components/progress';
import RadioButtonOffIcon from 'components/icons/radio-button-off';
import DoneIcons from 'components/icons/done';
import Transition from 'components/transition';
import ClickOff from 'components/click-off';

import style from 'sass/components/onboard-progress';


class OnboardProgress extends Component {
  state = { open: false };

  render() {
    const { viewer } = this.props;
    const { open } = this.state;

    const status = {
      hasGoal: viewer.goals.edges.length > 0,
      hasBill: viewer.bills.edges.length > 0,
      hasLabel: viewer.labels.edges.length > 0,
      hasExternalAccount: viewer.externalAccounts.edges.length > 0,
    };

    const progressTarget = Object.keys(status).length;
    const progressCurrent = _.values(status).filter((v)=> v).length;

    if (progressTarget === progressCurrent)
      return null;

    return (
      <div className={style.root}>
        <div
          className='appbar-container'
          onClick={()=> this.setState({ open: !open })}
        >
          <Progress current={progressCurrent + 1} target={progressTarget + 1}/>
        </div>
        <Transition show={open}>
          <ClickOff
            className='todos'
            onClickOff={()=> this.setState({ open: false })}
          >
            <h4>Get Started</h4>
            <ul>
              <li
                className={status.hasGoal ? 'done' : 'not-done'}
                onClick={()=> browserHistory.push('/app/goals/new')}
              >
                <div>{status.hasGoal ? <DoneIcons/> : <RadioButtonOffIcon/>}</div>
                <div>
                  <div className='title'>Set A Goal</div>
                  <div className='description'>For money that you keep</div>
                </div>
              </li>
              <li
                className={status.hasBill ? 'done' : 'not-done'}
                onClick={()=> browserHistory.push('/app/labels/new/bill')}
              >
                <div>{status.hasBill ? <DoneIcons/> : <RadioButtonOffIcon/>}</div>
                <div>
                  <div className='title'>Add A Bill</div>
                  <div className='description'>For monthly recurring expenses</div>
                </div>
              </li>
              <li
                className={status.hasLabel ? 'done' : 'not-done'}
                onClick={()=> browserHistory.push('/app/labels/new/expense')}
              >
                <div>{status.hasLabel ? <DoneIcons/> : <RadioButtonOffIcon/>}</div>
                <div>
                  <div className='title'>Add A Label</div>
                  <div className='description'>For non-recurring expenses</div>
                </div>
              </li>
              <li
                className={status.hasExternalAccount ? 'done' : 'not-done'}
                onClick={()=> browserHistory.push('/app/labels/new/account')}
              >
                <div>{status.hasExternalAccount ? <DoneIcons/> : <RadioButtonOffIcon/>}</div>
                <div>
                  <div className='title'>Add An External Account</div>
                  <div className='description'>Transfers to accounts that aren't connected</div>
                </div>
              </li>
            </ul>
          </ClickOff>
        </Transition>
      </div>
    );
  }
}

OnboardProgress = Relay.createContainer(OnboardProgress, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        goals(first: 1) {
          edges { node { id } }
        }

        bills: buckets(first: 1, type: "bill") {
          edges { node { id } }
        }

        labels: buckets(first: 1, type: "expense") {
          edges { node { id } }
        }

        externalAccounts: buckets(first: 1, type: "account") {
          edges { node { id } }
        }
      }
    `,
  },
});

export default OnboardProgress;
