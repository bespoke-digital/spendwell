
import { Component, PropTypes } from 'react';
import { Form } from 'formsy-react';

import Card from 'components/card';
import CardList from 'components/card-list';
import Button from 'components/button';
import Input from 'components/forms/input';


export default class TransactionFilters extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    filters: PropTypes.array.isRequired,
  };

  updateFilter(index, key, value) {
    const { filters } = this.props;

    filters[index][key] = value;

    this.props.onChange(filters);
  }

  addFilter() {
    const { filters } = this.props;

    this.props.onChange(filters.concat([{ type: 'name', name: '' }]));
  }

  render() {
    const { filters, children } = this.props;

    return (
      <div>
        <CardList>
          <Card className='card-list-headings'>Filters</Card>
          {filters.map((filter, index)=>
            filter.type !== 'hidden' ?
              <Card key={index}>
                <Form>
                  <Input
                    name='name'
                    label='Name'
                    value={filter.name}
                    onChange={this.updateFilter.bind(this, index, 'name')}
                  />
                </Form>
              </Card>
            : null
          )}
          <Card>
            <div className='summary'>
              <div>
                <Button onClick={::this.addFilter}>
                  <i className='fa fa-plus'/>
                  {' Add Filter'}
                </Button>
              </div>
              <div>
                {children}
              </div>
            </div>
          </Card>
        </CardList>
      </div>
    );
  }
}
