
import { Component, PropTypes } from 'react'
import moment from 'moment'

import Card from 'components/card'
import Button from 'components/button'
import Icon from 'components/icon'

import styles from 'sass/components/month-selector.scss'

export default class MonthSelector extends Component {
  static propTypes = {
    month: PropTypes.instanceOf(moment).isRequired,
    onChange: PropTypes.func.isRequired,
    first: PropTypes.instanceOf(moment),
  };

  render () {
    const { month, onChange, first } = this.props

    const periods = {
      current: month,
      previous: month.clone().subtract(1, 'month'),
      next: month.clone().add(1, 'month'),
    }

    const now = moment().startOf('month')

    return (
      <Card className={styles.root}>
        <Button
          onClick={() => onChange(periods.previous)}
          disabled={first ? periods.previous.isBefore(first) : false}
          color='default'
          flat
        >
          <Icon type='chevron left'/>
        </Button>

        <div className='current'>{periods.current.format('MMMM YYYY')}</div>

        <Button
          onClick={() => onChange(periods.next)}
          disabled={periods.next.isAfter(now)}
          color='default'
          flat
        >
          <Icon type='chevron right'/>
        </Button>
      </Card>
    )
  }
}
