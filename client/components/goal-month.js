
import { Component, PropTypes } from 'react'
import Relay from 'react-relay'

import Card from 'components/card'
import Money from 'components/money'
import Button from 'components/button'
import CardActions from 'components/card-actions'
import UpdateGoalSheet from 'components/update-goal-sheet'

import eventEmitter from 'utils/event-emitter'


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

  state = {
    updateGoal: false,
  };

  forceFetch () {
    eventEmitter.emit('forceFetch')
  }

  render () {
    const { viewer, goalMonth, onClick, selected, className } = this.props
    const { updateGoal } = this.state

    return (
      <Card onClick={onClick} expanded={selected} className={`goal ${className}`} summary={
        <div>
          <div className='icon'><div>{goalMonth.name[0]}</div></div>
          <div>{goalMonth.name}</div>
          <div className='amount'><Money abs={true} amount={goalMonth.targetAmount}/></div>
        </div>
      }>
        <CardActions>
          <Button onClick={() => this.setState({ updateGoal: true })}>Edit</Button>
        </CardActions>

        <UpdateGoalSheet
          viewer={viewer}
          goal={goalMonth.goal}
          visible={updateGoal}
          onRequestClose={() => this.setState({ updateGoal: false })}
          onUpdated={::this.forceFetch}
          onDeleted={::this.forceFetch}
        />
      </Card>
    )
  }
}

GoalMonth = Relay.createContainer(GoalMonth, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${UpdateGoalSheet.getFragment('viewer')}
      }
    `,
    goalMonth: () => Relay.QL`
      fragment on GoalMonthNode {
        name
        targetAmount

        goal {
          ${UpdateGoalSheet.getFragment('goal')}
        }
      }
    `,
  },
})

export default GoalMonth
