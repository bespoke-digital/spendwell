
import _ from 'lodash';
import { Component } from 'react';
import Relay from 'react-relay';
import { Form } from 'formsy-react';

import Input from 'components/forms/input';
import Card from 'components/card';
import CardList from 'components/card-list';
import Button from 'components/button';
import { ConnectInstitutionMutation } from 'mutations/institutions';
import styles from 'sass/views/plaid-add.scss';


class AddPlaid extends Component {
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
    fetch(`https://${window.ENV.PLAID_PRODUCTION ? 'api' : 'tartan'}.plaid.com` +
        `/institutions/search?p=connect&q=${query}`)
      .then((response)=> response.json())
      .then((results)=> this.setState({ results }));
  }

  selectFi(institution) {

    window.Plaid.create({
      clientName: 'SpendWell',
      key: window.ENV.PLAID_PUBLIC_KEY,
      product: 'connect',
      longTail: true,
      env: window.ENV.PLAID_PRODUCTION ? 'production' : 'tartan',
      onSuccess: (publicToken)=> {
        this.setState({ playItAgain: { institution, publicToken } });
        this.connect({ institution, publicToken });
      },
    }).open(institution.id);
  }

  connect({ institution, publicToken }) {
    const { viewer } = this.props;
    console.log('ConnectInstitutionMutation', { viewer, institution, publicToken });
    Relay.Store.commitUpdate(
      new ConnectInstitutionMutation({ viewer, institution, publicToken }),
      {
        onSuccess: console.log.bind(console, 'onSuccess'),
        onFailure: console.log.bind(console, 'onFailure'),
      },
    );
  }

  render() {
    const { playItAgain, results } = this.state;
    return (
      <div className={`container ${styles.root}`}>
        <h1>Connect Plaid</h1>

        {playItAgain ?
          <Button onClick={()=> this.connect(playItAgain)}>Replay</Button>
        : null}

        <Form>
          <Input name='query' label='Search' onChange={this.handleSearch}/>
        </Form>

        <CardList>
          {results.map((fi)=> (
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


AddPlaid = Relay.createContainer(AddPlaid, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${ConnectInstitutionMutation.getFragment('viewer')}
      }
    `,
  },
});

export default AddPlaid;
