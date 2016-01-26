/* global Plaid */

import _ from 'lodash';
import { Component } from 'react';
import { Form } from 'formsy-react';
import reactMixin from 'react-mixin';

import Card from 'components/card';
import Input from 'components/forms/input';
import Institution from 'collections/institutions';

import style from 'sass/views/connect';


@reactMixin.decorate(ReactMeteorData)
export default class Connect extends Component {
  constructor() {
    super();
    this.state = { results: [] };
    this.handleSearch = _.debounce(this.handleSearch.bind(this), 300);
  }

  getMeteorData() {
    return {
      institutions: Institution.find({}).fetch(),
    };
  }

  componentDidMount() {
    if (!Plaid) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://cdn.plaid.com/link/stable/link-initialize.js';
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }

  handleSearch(value) {
    fetch(`https://${PLAID_PRODUCTION ? 'api' : 'tartan'}.plaid.com` +
        `/institutions/search?p=connect&q=${value}`)
      .then((response)=> response.json())
      .then((results)=> this.setState({ results }));
  }

  connectInstitution({ id, publicToken }) {
    Meteor.call('connectInstitution', { id, publicToken }, (error)=> {
      if (error) throw error;
      console.log('SUCCESS');
    });
  }

  selectFi(fi) {
    Plaid.create({
      clientName: 'Moneybase',
      key: '4b747132cf8c427bec79f00e0dcb4a',
      product: 'connect',
      longTail: true,
      env: PLAID_PRODUCTION ? 'production' : 'tartan',
      onSuccess: (publicToken)=> {
        const connectOpts = { id: fi.id, publicToken };
        console.log(connectOpts);
        this.setState({ playItAgain: connectOpts });
        this.connectInstitution(connectOpts);
      },
    }).open(fi.id);
  }

  render() {
    const { playItAgain } = this.state;
    const { institutions } = this.data;

    return (
      <div className={`container ${style.root}`}>
        <h1>Connect Account ({institutions.length} connected)</h1>

        { playItAgain ? (
          <a href='#' onClick={()=> this.connectInstitution(playItAgain)}>
            Play it again
          </a>
        ) : null}

        <Form>
          <Input name='search' label='Search' onChange={::this.handleSearch}/>
        </Form>

        <div>
          {this.state.results.map((fi)=> (
            <Card
              key={fi.id}
              className='fi'
              onClick={this.selectFi.bind(this, fi)}
              style={{ backgroundColor: fi.colors.darker }}
            >
              {fi.logo ? <img src={`data:image/png;base64,${fi.logo}`} alt={fi.name}/> : null}

              <div className='fi-name'>
                <strong>{fi.nameBreak ? fi.name.slice(0, fi.nameBreak) : fi.name}</strong><br/>
                {fi.nameBreak ? fi.name.slice(fi.nameBreak) : null}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
}
