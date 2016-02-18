
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import moment from 'moment';

import Card from 'components/card';
import Money from 'components/money';
import Progress from 'components/progress';


class GoalMonth extends Component {
  static propTypes = {
    month: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    selected: PropTypes.bool,
  };

  static defaultProps = {
    selected: false,
  };

  render() {
    const { goalMonth, onClick, selected, children, month } = this.props;

    const currentMonth = month.isAfter(moment().subtract(1, 'month'));
    const full = goalMonth.targetAmount === goalMonth.filledAmount;

    return (
      <Card onClick={onClick} expanded={selected} className={`
        goal
        ${!currentMonth && !full ? 'goal-danger' : ''}
        ${currentMonth && !full ? 'goal-warn' : ''}
      `} summary={
        <div>
          <div>{goalMonth.name}</div>
          <div className='amount avg'><Money abs={true} amount={goalMonth.targetAmount}/></div>
          <div className='amount'><Money abs={true} amount={goalMonth.filledAmount}/></div>
        </div>
      }>
        <Progress current={goalMonth.filledAmount} target={goalMonth.targetAmount}/>
        {goalMonth.targetAmount !== goalMonth.filledAmount ?
          <div className='progress-numbers'>
            <div><Money abs={true} amount={goalMonth.filledAmount}/></div>
            <div><Money abs={true} amount={goalMonth.targetAmount}/></div>
          </div>
        :
          <div className='progress-achieved'>Goal Achieved!</div>
        }
        <div className='goal-children'>{children}</div>
      </Card>
    );
  }
}

GoalMonth = Relay.createContainer(GoalMonth, {
  fragments: {
    goalMonth: ()=> Relay.QL`
      fragment on GoalMonthNode {
        name
        targetAmount
        filledAmount
      }
    `,
  },
});

export default GoalMonth;
