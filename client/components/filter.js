
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import CardList from 'components/card-list';
import Button from 'components/button';
import TextInput from 'components/text-input';
import Dropdown from 'components/dropdown';
import TransactionList from 'components/transaction-list';

import FIELDS from 'constants/filter-fields';

import style from 'sass/components/filter';


class Filter extends Component {
  static propTypes = {
    filter: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onCollapse: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.relay.setVariables({ filters: [this.props.filter] });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.filter !== this.props.filter)
      this.props.relay.setVariables({ filters: [nextProps.filter] });
  }

  updateField(field, value) {
    const filter = _.cloneDeep(this.props.filter);

    filter[field] = this.toData(field, value);

    this.props.onChange(filter);
  }

  replaceField(oldField, newField, event) {
    if (event) event.preventDefault();

    const filter = _.cloneDeep(this.props.filter);

    filter[newField] = filter[oldField];
    delete filter[oldField];

    this.props.onChange(filter);
  }

  removeField(field) {
    const filter = _.cloneDeep(this.props.filter);

    delete filter[field];

    this.props.onChange(filter);
  }

  addField(field, event) {
    if (event) event.preventDefault();

    if (!this.props.filter[field]) {
      const filter = _.cloneDeep(this.props.filter);

      filter[field] = null;

      this.props.onChange(filter);
    }
  }

  loadTransactions() {
    const { relay } = this.props;
    relay.setVariables({ count: relay.variables.count + 10 });
  }

  toInput(field, value) {
    if (FIELDS[field].type === 'number' && _.isNumber(value))
      value = (value / 100).toString();
    return value;
  }

  toData(field, value) {
    if (FIELDS[field].type === 'number' && _.isNumber(value))
      value = parseInt(parseFloat(value) * 100);
    return value;
  }

  renderDropdown(usedFields, selected) {
    const fields = _.filter(
      Object.keys(FIELDS),
      (field)=> usedFields.indexOf(field) === -1 || field === selected
    );

    if (fields.length === 0)
      return null;

    const label = selected ? FIELDS[selected].label : 'Add Field';

    return (
      <Dropdown label={label}>
        {fields.map((field)=>
          <a
            href='#'
            key={FIELDS[field].label}
            onClick={selected ?
              this.replaceField.bind(this, selected, field)
            :
              this.addField.bind(this, field)
            }
          >
            {FIELDS[field].label}
          </a>
        )}
      </Dropdown>
    );
  }

  render() {
    const { filter, viewer, onCollapse } = this.props;
    const fields = Object.keys(filter);

    return (
      <div className={style.root}>
        <CardList>
          {fields.map((field)=> FIELDS[field] ?
            <Card key={field} className='field'>
              {this.renderDropdown(fields, field)}

              <TextInput
                value={this.toInput(field, filter[field])}
                onChange={this.updateField.bind(this, field)}
              />

              <Button onClick={()=> this.removeField(field)}>
                Remove Field
              </Button>
            </Card>
          : null)}

          <Card className='save-card'>
            <Button onClick={onCollapse} variant='primary'>Save</Button>
            {this.renderDropdown(fields)}
          </Card>
        </CardList>

        <TransactionList transactions={viewer.transactions}/>

        {viewer.transactions.pageInfo.hasNextPage ?
          <div className='bottom-buttons'>
            <Button flat variant='primary' onClick={::this.loadTransactions}>Load More</Button>
          </div>
        : null}
      </div>
    );
  }
}

Filter = Relay.createContainer(Filter, {
  initialVariables: {
    filters: [],
    count: 10,
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        transactions(
          first: $count,
          filters: $filters,
          isTransfer: false,
          fromSavings: false,
        ) {
          ${TransactionList.getFragment('transactions')}

          pageInfo {
            hasNextPage
          }
        }
      }
    `,
  },
});

export default Filter;
