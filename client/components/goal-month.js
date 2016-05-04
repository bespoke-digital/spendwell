
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import Money from 'components/money';
import A from 'components/a';
import TextActions from 'components/text-actions';


class GoalMonth extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    selected: PropTypes.bool,
    className: PropTypes.string,
  };

  static defaultProps = {
    selected: false,
    className: '',
  };

  render() {
    const { goalMonth, onClick, selected, className } = this.props;

    const full = goalMonth.targetAmount === goalMonth.filledAmount;
    const empty = goalMonth.filledAmount === 0;

    return (
      <Card onClick={onClick} expanded={selected} className={`
        goal
        ${empty ? 'goal-danger' : ''}
        ${!empty && !full ? 'goal-warn' : ''}
        ${className}
      `} summary={
        <div>
          <div className='icon'><div>{goalMonth.name[0]}</div></div>
          <div>{goalMonth.name}</div>
          <div className='amount avg'><Money abs={true} amount={goalMonth.targetAmount}/></div>
          <div className='amount'><Money abs={true} amount={goalMonth.filledAmount}/></div>
        </div>
      }>
        <TextActions>
          <A href={`/app/goals/${goalMonth.goal.id}/edit`}>Edit</A>
        </TextActions>
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
