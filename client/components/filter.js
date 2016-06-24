
import _ from 'lodash'
import { Component, PropTypes } from 'react'
import Relay from 'react-relay'

import SuperCard from 'components/super-card'
import Card from 'components/card'
import CardList from 'components/card-list'
import Button from 'components/button'
import TextInput from 'components/text-input'
import Dropdown from 'components/dropdown'
import TransactionList from 'components/transaction-list'
import MoneyInput from 'components/money-input'
import Money from 'components/money'
import A from 'components/a'
import Select from 'components/select'

import style from 'sass/components/filter'


export class Filter {
  static fields = {
    descriptionExact: { label: 'Description Exact', type: 'string' },
    descriptionContains: { label: 'Description Contains', type: 'string' },
    amountExact: { label: 'Amount Equals', type: 'money' },
    amountGt: { label: 'Amount Less Than', type: 'money' },
    amountLt: { label: 'Amount Greater Than', type: 'money' },
    account: { label: 'Account', type: 'account' },
  };

  constructor (source, onChange) {
    this.onChange = onChange

    if (typeof source === Filter)
      this._data = source.raw()

    else if (_.isPlainObject(source))
      this._data = source

    else
      this._data = { descriptionContains: '' }
  }

  _castValue (field, value) {
    const type = Filter.fields[field].type

    if (type === 'money' && _.isString(value)) {
      value = parseInt(value.replace(/\D/, ''))
      if (_.isNaN(value))
        value = 0
    }

    if (type === 'money' && value > 0)
      value = (-value)

    return value
  }

  update (key, value) {
    this._data = _.clone(this._data)
    this._data[key] = this._castValue(key, value)

    this.onChange(this._data)
  }

  replace (oldField, newField) {
    if (oldField === newField) return

    this._data = _.clone(this._data)
    this._data[newField] = this._castValue(newField, this._data[oldField])
    delete this._data[oldField]

    this.onChange(this._data)
  }

  remove (key) {
    this._data = _.clone(this._data)
    delete this._data[key]

    this.onChange(this._data)
  }

  add (key) {
    if (this._data[key]) return

    this._data = _.clone(this._data)
    this._data[key] = null

    this.onChange(this._data)
  }

  fields () {
    return Object.keys(this._data)
  }

  length () {
    return this.fields().length
  }

  value (key) {
    return this._data[key]
  }

  name (accounts) {
    const fields = Object.keys(_.pick(this._data, (v) => !(_.isNull(v) || v === '')))

    if (fields.length === 0)
      return 'New'

    return fields.map((key) => {
      const { type, label } = Filter.fields[key]
      const value = this._data[key]

      return (
        <span className='field' key={key}>
          <strong>{label}{':'}&nbsp;</strong>
          {type === 'money' ?
            <Money amount={value} abs={true}/>
          : type === 'account' ?
            _.find(accounts.edges, ({ node }) => node.id === value).node.name
          : value}
        </span>
      )
    })
  }
}


function FilterDropdown ({ discludeFields, label, onSelect }) {
  const fields = Object.keys(Filter.fields).filter(
    (field) => discludeFields.indexOf(field) === -1
  )

  if (fields.length === 0)
    return null

  return (
    <Dropdown label={label}>
      {fields.map((field) =>
        <A key={field} onClick={() => onSelect(field)}>
          {Filter.fields[field].label}
        </A>
      )}
    </Dropdown>
  )
}


class FilterComponent extends Component {
  static propTypes = {
    filter: PropTypes.object.isRequired,
    onExpand: PropTypes.func.isRequired,
    onCollapse: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    onRemove: PropTypes.func.isRequired,
    canRemove: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  constructor () {
    super()
    this.updateTransactionsFilter = _.debounce(this.updateTransactionsFilter.bind(this), 300)
  }

  componentDidMount () {
    this.props.relay.setVariables({ filters: [this.props.filter] })
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.filter !== this.props.filter)
      this.updateTransactionsFilter(nextProps.filter)
  }

  loadTransactions () {
    const { relay } = this.props
    relay.setVariables({ count: relay.variables.count + 10 })
  }

  updateTransactionsFilter (filter) {
    this.props.relay.setVariables({ filters: [filter] })
  }

  render () {
    const {
      viewer,
      onCollapse,
      onExpand,
      expanded,
      onRemove,
      canRemove,
      onChange,
    } = this.props

    const filter = new Filter(this.props.filter, onChange)

    return (
      <SuperCard
        className={style.root}
        expanded={expanded}
        onSummaryClick={onExpand}
        summary={
          <Card summary={
            <div>
              <div className='filter-name'>
                <div className='subtitle'>Filter</div>
                <div>{filter.name(viewer.accounts)}</div>
              </div>
              <Button onClick={onRemove} disabled={canRemove}>
                Remove Filter
              </Button>
            </div>
          }/>
        }
      >
        <CardList>
          {filter.fields().map((field) => Filter.fields[field] ?
            <Card key={field} className='field'>
              <FilterDropdown
                discludeFields={[field]}
                label={Filter.fields[field].label}
                onSelect={(selected) => filter.replace(field, selected)}
              />

              {Filter.fields[field].type === 'money' ?
                <MoneyInput
                  initialValue={Math.abs(filter.value(field))}
                  onChange={(value) => filter.update(field, value)}
                />
              : Filter.fields[field].type === 'account' ?
                <Select
                  initialValue={filter.value(field)}
                  onChange={(value) => filter.update(field, value)}
                  label='Select Account'
                  selectedLabel={false}
                  options={viewer.accounts.edges.map(({ node }) => (
                    { label: node.name, value: node.id }
                  ))}
                />
              :
                <TextInput
                  value={filter.value(field)}
                  onChange={(value) => filter.update(field, value)}
                />
              }

              <Button
                onClick={() => filter.remove(field)}
                disabled={filter.length() === 1}
              >
                Remove Field
              </Button>
            </Card>
          : null)}

          <Card className='save-card'>
            <Button onClick={onCollapse}>Save</Button>
            <FilterDropdown
              discludeFields={filter.fields()}
              label='New Field'
              onSelect={(selected) => filter.add(selected)}
            />
          </Card>
        </CardList>

        <TransactionList viewer={viewer} transactions={viewer.transactions} months={true}/>

        {viewer.transactions.pageInfo.hasNextPage ?
          <div className='bottom-buttons'>
            <Button onClick={::this.loadTransactions}>Load More</Button>
          </div>
        : null}
      </SuperCard>
    )
  }
}

FilterComponent = Relay.createContainer(FilterComponent, {
  initialVariables: {
    filters: [],
    count: 10,
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${TransactionList.getFragment('viewer')}

        transactions(
          first: $count,
          filters: $filters,
          isTransfer: false,
          fromSavings: false,
          amountLt: 0,
        ) {
          ${TransactionList.getFragment('transactions')}

          pageInfo {
            hasNextPage
          }
        }

        accounts(first: 100, disabled: false) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
  },
})

export default FilterComponent
