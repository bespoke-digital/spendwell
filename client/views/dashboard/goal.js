
import { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import moment from 'moment';

import Card from 'components/card';
import Money from 'components/money';
import Progress from 'components/progress';


@reactMixin.decorate(ReactMeteorData)
export default class Goal extends Component {
  static propTypes = {
    goal: PropTypes.object.isRequired,
    month: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    selected: PropTypes.bool,
  };

  static defaultProps = {
    selected: false,
  };

  getMeteorData() {
    return {};
  }

  render() {
    const { goal, onClick, selected, children, month } = this.props;

    const currentMonth = month.isAfter(moment().subtract(1, 'month'));
    const full = goal.amount === goal.filled;

    return (
      <Card onClick={onClick} expanded={selected} className={`
        goal
        ${!currentMonth && !full ? 'goal-danger' : ''}
        ${currentMonth && !full ? 'goal-warn' : ''}
      `}>
        <div className='summary'>
          <div>{goal.name}</div>
          <div className='amount avg'><Money amount={goal.amount}/></div>
          <div className='amount'><Money amount={goal.filled}/></div>
        </div>

        {selected ?
          <div>
            <Progress current={goal.filled} target={goal.amount}/>
            {goal.amount !== goal.filled ?
              <div className='progress-numbers'>
                <div><Money amount={goal.filled}/></div>
                <div><Money amount={goal.amount}/></div>
              </div>
            :
              <div className='progress-achieved'>Goal Achieved!</div>
            }
            <div className='goal-children'>{children}</div>
          </div>
        : null}

      </Card>
    );
  }
}
