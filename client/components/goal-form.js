
import _ from 'lodash'
import { Component } from 'react'
import Relay from 'react-relay'

import Card from 'components/card'
import CardList from 'components/card-list'
import TextInput from 'components/text-input'

import style from 'sass/components/goal-form'


function getInitialState ({ goal }) {
  return {
    name: goal ? goal.name : '',
    monthlyAmount: goal ? goal.monthlyAmount : 0,
  }
}

class GoalForm extends Component {
  constructor (props) {
    super()
    this.state = getInitialState(props)
  }

  getData () {
    const { name, monthlyAmount } = this.state
    return { name, monthlyAmount }
  }

  reset () {
    this.setState(getInitialState(this.props))
  }

  isValid () {
    const { name, monthlyAmount } = this.state
    return monthlyAmount !== 0 & name.length > 0
  }

  handleMonthlyAmountChange (monthlyAmount) {
    monthlyAmount = -parseInt(monthlyAmount * 100)
    if (!_.isNaN(monthlyAmount))
      this.setState({ monthlyAmount })
  }

  render () {
    const { name, monthlyAmount } = this.state

    return (
      <CardList className={style.root}>
        <Card>
          <TextInput
            label='Name'
            value={name}
            onChange={(name) => this.setState({ name })}
            autoFocus={true}
          />
        </Card>
        <Card>
          <TextInput
            label='Monthly Amount'
            value={_.isNumber(monthlyAmount) && monthlyAmount !== 0 ?
              (Math.abs(monthlyAmount) / 100).toString()
            : ''}
            onChange={::this.handleMonthlyAmountChange}
          />
        </Card>
      </CardList>
    )
  }
}

GoalForm = Relay.createContainer(GoalForm, {
  fragments: {
    goal: () => Relay.QL`
      fragment on GoalNode {
        name
        monthlyAmount
      }
    `,
  },
})

export default GoalForm
