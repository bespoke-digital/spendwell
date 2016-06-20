
import { Component, PropTypes } from 'react'
import Relay from 'react-relay'

import Card from 'components/card'
import Button from 'components/button'
import Filter from 'components/filter'

import style from 'sass/components/filters'


class Filters extends Component {
  static propTypes = {
    filters: PropTypes.array.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
  };

  constructor () {
    super()
    this.state = { selected: null }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.filters.length > this.props.filters.length)
      this.setState({ selected: nextProps.filters.length - 1 })
  }

  selectFilter (index) {
    const { selected } = this.state

    if (selected === index) index = null

    this.setState({ selected: index })
  }

  render () {
    const { filters, viewer, onRemove, onAdd, onChange } = this.props
    const { selected } = this.state

    return (
      <div className={style.root}>
        {filters.map((filter, index) => (
          <Filter
            key={index}
            viewer={viewer}
            filter={filter}
            onExpand={this.selectFilter.bind(this, index)}
            onCollapse={this.selectFilter.bind(this, null)}
            expanded={selected === index}
            onRemove={() => onRemove(index)}
            canRemove={filters.length === 1}
            onChange={(filter) => onChange(index, filter)}
          />
        ))}

        <Card>
          <Button onClick={onAdd}>
            add filter
          </Button>
        </Card>
      </div>
    )
  }
}

Filters = Relay.createContainer(Filters, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${Filter.getFragment('viewer')}
      }
    `,
  },
})

export default Filters
