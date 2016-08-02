import React from 'react'

import Card from 'components/card'

import style from 'sass/components/goal-card'

export default class GoalCard extends React.Component {
  render() {
    return (
      <Card className={style.root}>
        <h2>Goal: <small>{this.props.node.name}</small></h2>
        <h3>${Math.abs(this.props.node.targetAmount / 100).toFixed(0)} this month</h3>
        <h3>$5000 total</h3>
      </Card>
    )
  }
}
