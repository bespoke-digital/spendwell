
import _ from 'lodash';
import { Component } from 'react';
import Relay from 'react-relay';
import relayContainer from 'relay-decorator';
import { Form } from 'formsy-react';

import Input from 'components/forms/input';
import Card from 'components/card';
import CardList from 'components/card-list';
import styles from 'sass/views/plaid-add.scss';


@relayContainer({
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        institutions(first: 1) {
          edges {
            node {
              name
            }
          }
        }
      }
    `,
  },
})
export default class PlaidAdd extends Component {
  constructor() {
    super();
    this.state = { results: [] };
    this.handleSearch = _.debounce(this.handleSearch.bind(this), 300);
  }

  componentDidMount() {
    if (!window.Plaid) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://cdn.plaid.com/link/stable/link-initialize.js';
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }

  handleSearch(query) {
    fetch(`https://${PLAID_PRODUCTION ? 'api' : 'tartan'}.plaid.com` +
        `/institutions/search?p=connect&q=${query}`)
      .then((response)=> response.json())
      .then((results)=> this.setState({ results }));
  }

  selectFi(fi) {
    window.Plaid.create({
      clientName: 'Moneybase',
      key: '4b747132cf8c427bec79f00e0dcb4a',
      product: 'connect',
      longTail: true,
      env: PLAID_PRODUCTION ? 'production' : 'tartan',
      onSuccess: (publicToken)=> {
        this.setState({ playItAgain: { id: fi.id, publicToken } });

        console.log('connectInstitution', { id: fi.id, publicToken });
      },
    }).open(fi.id);
  }

  render() {
    return (
      <div className={`container ${styles.root}`}>
        <h1>Connect Plaid Accounts</h1>

        <Form>
          <Input name='query' label='Search' onChange={this.handleSearch}/>
        </Form>

        <CardList>
          {this.state.results.map((fi)=> (
            <Card
              className='fi'
              onClick={this.selectFi.bind(this, fi)}
              key={fi.id}
              style={{ backgroundColor: fi.colors.darker }}
            >
              {fi.logo ? <img src={`data:image/png;base64,${fi.logo}`} alt={fi.name}/> : null}

              <div className='fi-name'>
                <strong>{fi.nameBreak ? fi.name.slice(0, fi.nameBreak) : fi.name}</strong><br/>
                {fi.nameBreak ? fi.name.slice(fi.nameBreak) : null}
              </div>
            </Card>
          ))}
        </CardList>
      </div>
    );
  }
}
