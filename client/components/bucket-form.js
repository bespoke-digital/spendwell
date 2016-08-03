
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
    fixedAmount: bucket ? bucket.fixedAmount : 0,
    useFixedAmount: bucket ? bucket.useFixedAmount : type === 'goal',
    goalType: bucket && bucket.type === 'goal' && bucket.filters && bucket.filters.length ? 'filter' : 'amount',
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
    const { name, filters, fixedAmount, useFixedAmount } = this.state
    return { name, filters: cleanFilters(filters), fixedAmount, useFixedAmount }
  }

  reset () {
    this.setState(getInitialState(this.props))
  }

  isValid () {
    const { type, filters, name } = this.state
    return (type === 'goal' || filters.length > 0) & name.length > 0
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
    this.setState({ goalType: 'filter' })
    if (!this.state.filters) {
      this.handleAddFilter()
    }
  }

  selectAmountGoal () {
    this.setState({ goalType: 'amount', filters: [] })
  }

  handleFixedAmountChange (fixedAmount) {
    fixedAmount = -parseInt(fixedAmount * 100)
    if (!_.isNaN(fixedAmount)) {
      this.setState({ fixedAmount })
    }
  }

  render () {
    const { viewer } = this.props
    const { name, type, filters, goalType, fixedAmount, useFixedAmount } = this.state

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
                {!useFixedAmount ?
                  <Money amount={viewer.transactions.avgAmount} abs/>
                :
                  <TextInput
                    value={_.isNumber(fixedAmount) && fixedAmount !== 0 ?
                      centsForInput(fixedAmount)
                    :
                      centsForInput(viewer.transactions.avgAmount)
                    }
                    onChange={::this.handleFixedAmountChange}
                    autoFocus
                  />
                }
              </div>
              <div
                className='filter-goal-amount-toggle'
                onClick={() => this.setState({ useFixedAmount: !useFixedAmount })}
              >
                <Icon type={!useFixedAmount ? 'check box' : 'check box outline blank'}/>
                Use transaction average
              </div>
            </Card>
          : null}

          {type === 'goal' && goalType === 'amount' ?
            <Card>
              <TextInput
                label='Monthly Amount'
                value={_.isNumber(fixedAmount) && fixedAmount !== 0 ? centsForInput(fixedAmount) : ''}
                onChange={::this.handleFixedAmountChange}
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
        fixedAmount
        useFixedAmount

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
