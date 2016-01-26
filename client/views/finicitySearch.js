
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import { Form } from 'formsy-react';

import CardList from 'components/card-list';
import Card from 'components/card';
import Input from 'components/forms/input';


export default class FinicitySearch extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = { results: [] };
    this.handleSearch = _.debounce(this.handleSearch.bind(this), 300);
  }

  handleSearch(value) {
    Meteor.call('finicitySearch', value, (error, results)=> {
      if (error) throw error;

      if (!results)
        throw new Error('no results from search');

      this.setState({ results });
    });
  }

  selectFi(fi) {
    this.props.history.pushState(null, `/connect/finicity/${fi.id}`);
  }

  render() {
    const { results } = this.state;

    return (
      <div className='container'>
        <h1>Connect Account (w/ Finicity)</h1>

        <Form>
          <Input name='search' label='Search' onChange={::this.handleSearch}/>
        </Form>

        <CardList>
          {results.map((fi)=> (
            <Card key={fi.id} onClick={this.selectFi.bind(this, fi)}>
              <div className='summary'>
                {fi.name} ({fi.accountTypeDescription})
              </div>
            </Card>
          ))}
        </CardList>
      </div>
    );
  }
}
