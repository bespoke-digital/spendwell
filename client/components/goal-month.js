
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import Money from 'components/money';
import Button from 'components/button';


class GoalMonth extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    selected: PropTypes.bool,
  };

  static defaultProps = {
    selected: false,
  };

  render() {
    const { goalMonth, onClick, selected } = this.props;

    const full = goalMonth.targetAmount === goalMonth.filledAmount;
    const empty = goalMonth.filledAmount === 0;

    return (
      <Card onClick={onClick} expanded={selected} className={`
        goal
        ${empty ? 'goal-danger' : ''}
        ${!empty && !full ? 'goal-warn' : ''}
      `} summary={
        <div>
          <div>{goalMonth.name}</div>
          <div className='amount avg'><Money abs={true} amount={goalMonth.targetAmount}/></div>
          <div className='amount'><Money abs={true} amount={goalMonth.filledAmount}/></div>
        </div>
      }>
        <strong>Projected annual amount:</strong>
        {' '}
        <Money abs={true} amount={goalMonth.targetAmount * 12}/>

        <div className='actions'>
          <Button to={`/app/goals/${goalMonth.goal.id}`}>View</Button>
          <Button to={`/app/goals/${goalMonth.goal.id}/edit`}>Edit</Button>
        </div>
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
        goal {
          id
        }
      }
    `,
  },
});

export default GoalMonth;
