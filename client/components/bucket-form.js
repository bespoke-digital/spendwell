
import _ from 'lodash'
import Relay from 'react-relay'
import { Component, PropTypes } from 'react'

import Card from 'components/card'
import CardList from 'components/card-list'
import TextInput from 'components/text-input'
import Filters from 'components/filters'
import TransactionList from 'components/transaction-list'
import ListHeading from 'components/list-heading'
import ButtonSeperator from 'components/button-seperator'
import Button from 'components/button'
import Money from 'components/money'
import StaticLabel from 'components/static-label'
import Icon from 'components/icon'

import style from 'sass/components/bucket-form'


function cleanFilter (filter) {
  return _.pick(filter, (v, k) => !(_.isNull(v) || k === '__dataID__' || v === ''))
}

function cleanFilters (filters) {
  if (!filters) return []

  return filters.map(cleanFilter).filter((filter) => _.some(_.values(filter)))
}

function centsForInput (value) {
  return (Math.abs(value) / 100).toString()
}

function getInitialState ({ bucket, type, initialFilters, initialName }) {
  return {
    filters: bucket ? cleanFilters(bucket.filters) : (initialFilters || []),
    name: bucket ? bucket.name : (initialName || ''),
    type: bucket ? bucket.type : type,
    goalAmount: bucket && bucket.type === 'goal' ? bucket.goalAmount : 0,
    goalType: bucket && bucket.type === 'goal' && bucket.filters.length ? 'filter' : 'amount',
    isFixed: true,
  }
}

class BucketForm extends Component {
  static propTypes = {
    relay: PropTypes.object.isRequired,
    viewer: PropTypes.object.isRequired,
    bucket: PropTypes.object,
    type: PropTypes.oneOf(['bill', 'expense', 'goal']),
    loading: PropTypes.bool,
    initialName: PropTypes.string,
    initialFilters: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    type: 'expense',
  };

  constructor (props) {
    super()
    this.state = getInitialState(props)
  }

  componentWillMount () {
    const { relay } = this.props
    const { filters } = this.state

    relay.setVariables({ filters: cleanFilters(filters) })
  }

  getData () {
    const { name, filters, goalAmount, isFixed } = this.state
    return { name, filters: cleanFilters(filters), goalAmount, isFixed }
  }

  reset () {
    this.setState(getInitialState(this.props))
  }

  isValid () {
    const { filters, name } = this.state
    return filters.length > 0 & name.length > 0
  }

  handleAddFilter () {
    const filters = _.clone(this.state.filters)

    filters.push({ descriptionContains: '' })

    this.setState({ filters })
  }

  handleRemoveFilter (index) {
    const filters = _.clone(this.state.filters)

    filters.splice(index, 1)

    this.setState({ filters })
    this.props.relay.setVariables({ filters: cleanFilters(filters) })
  }

  handleChangeFilter (index, filter) {
    const filters = _.clone(this.state.filters)

    filters[index] = filter

    this.setState({ filters })
    this.props.relay.setVariables({ filters: cleanFilters(filters) })
  }

  handleChangeName (name) {
    this.setState({ name })
  }

  handleLoad () {
    const { count } = this.props.relay.variables
    this.props.relay.setVariables({ count: count + 50 })
  }

  selectFilterGoal () {
    const { bucket } = this.props
    this.setState({
      goalType: 'filter',
      goalAmount: bucket && bucket.type === 'goal' ? bucket.goalAmount : 0,
    })
    if (!this.state.filters) {
      this.handleAddFilter()
    }
  }

  selectAmountGoal () {
    const { bucket } = this.props
    this.setState({
      goalType: 'amount',
      filters: [],
      goalAmount: bucket && bucket.type === 'goal' ? bucket.goalAmount : 0,
    })
  }

  handleGoalAmountChange (goalAmount) {
    goalAmount = -parseInt(goalAmount * 100)
    if (!_.isNaN(goalAmount)) {
      this.setState({ goalAmount })
    }
  }

  render () {
    const { viewer } = this.props
    const { name, type, filters, goalType, goalAmount, isFixed } = this.state

    return (
      <div className={style.root}>
        <CardList>
          <Card>
            <TextInput
              label='Name'
              value={name}
              onChange={::this.handleChangeName}
            />
          </Card>

          {type === 'goal' ?
            <Card>
              <Button
                active={goalType === 'amount'}
                onClick={::this.selectAmountGoal}
              >Fixed Amount</Button>
              <ButtonSeperator>or</ButtonSeperator>
              <Button
                active={goalType === 'filter'}
                onClick={::this.selectFilterGoal}
              >With Transactions</Button>
            </Card>
          : null}

          {type !== 'goal' || goalType === 'filter' ?
            <Filters
              filters={filters}
              viewer={viewer}
              onAdd={::this.handleAddFilter}
              onRemove={::this.handleRemoveFilter}
              onChange={::this.handleChangeFilter}
            />
          : null}

          {type === 'goal' && goalType === 'filter' && viewer.transactions ?
            <Card className='filter-goal-amount'>
              <StaticLabel>Monthly Amount</StaticLabel>
              <div className='filter-goal-amount-value'>
                {!isFixed ?
                  <Money amount={viewer.transactions.avgAmount} abs/>
                :
                  <TextInput
                    value={_.isNumber(goalAmount) && goalAmount !== 0 ?
                      centsForInput(goalAmount)
                    :
                      centsForInput(viewer.transactions.avgAmount)
                    }
                    onChange={::this.handleGoalAmountChange}
                    autoFocus
                  />
                }
              </div>
              <div
                className='filter-goal-amount-toggle'
                onClick={() => this.setState({ isFixed: !isFixed })}
              >
                <Icon type={!isFixed ? 'check box' : 'check box outline blank'}/>
                Use transaction average
              </div>
            </Card>
          : null}

          {type === 'goal' && goalType === 'amount' ?
            <Card>
              <TextInput
                label='Monthly Amount'
                value={_.isNumber(goalAmount) && goalAmount !== 0 ? centsForInput(goalAmount) : ''}
                onChange={::this.handleGoalAmountChange}
              />
            </Card>
          : null}
        </CardList>

        {type !== 'goal' || goalType === 'filter' ?
          <ListHeading>Filtered Transactions</ListHeading>
        : null}

        <CardList>
          {viewer.transactions ?
            <TransactionList
              viewer={viewer}
              transactions={viewer.transactions}
              months={true}
              onLoadMore={::this.handleLoad}
            />
          : null}
        </CardList>
      </div>
    )
  }
}

BucketForm = Relay.createContainer(BucketForm, {
  initialVariables: {
    includeTransactions: false,
    filters: [],
    count: 50,
    isTransfer: false,
  },
  prepareVariables (variables) {
    return {
      ...variables,
      includeTransactions: variables.filters.length > 0,
    }
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${Filters.getFragment('viewer')}
        ${TransactionList.getFragment('viewer')}

        transactions(first: $count, filters: $filters, isTransfer: $isTransfer) @include(if: $includeTransactions) {
          ${TransactionList.getFragment('transactions')}

          avgAmount
        }
      }
    `,
    bucket: () => Relay.QL`
      fragment on BucketNode {
        name
        type
        isFixed

        filters {
          amountGt
          amountLt
          amountExact
          dateGte
          dateLte
          descriptionContains
          descriptionExact
          account
        }
      }
    `,
  },
})

export default BucketForm
