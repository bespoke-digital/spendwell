
import _ from 'lodash';
import { Component } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import TextInput from 'components/text-input';
import Card from 'components/card';
import CardList from 'components/card-list';
import Transition from 'components/transition';
import FinicityAccountDialog from 'components/finicity-account-dialog';

import { ConnectPlaidInstitutionMutation } from 'mutations/institutions';

import { parseUrl } from 'utils';

import styles from 'sass/views/add-plaid.scss';


class ConnectAccount extends Component {
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
    const { relay } = this.props;

    relay.setVariables({ query });

    fetch(`https://${window.ENV.PLAID_PRODUCTION ? 'api' : 'tartan'}.plaid.com` +
        `/institutions/search?p=connect&q=${query}`)
      .then((response)=> response.json())
      .then((results)=> this.setState({ results }));
  }

  selectPlaid(fi) {
    window.Plaid.create({
      clientName: 'Spendwell',
      key: window.ENV.PLAID_PUBLIC_KEY,
      product: 'connect',
      longtail: true,
      env: window.ENV.PLAID_PRODUCTION ? 'production' : 'tartan',
      onSuccess: (publicToken)=> this.connectPlaid({ fi, publicToken }),
    }).open(fi.id);
  }

  connectPlaid({ fi, publicToken }) {
    const { viewer } = this.props;

    const mutationInput = {
      viewer,
      publicToken,
      plaidInstitutionId: fi.id,
    };

    Relay.Store.commitUpdate(new ConnectPlaidInstitutionMutation(mutationInput), {
      onFailure: ()=> console.log('Failure: ConnectPlaidInstitutionMutation'),
      onSuccess: ()=> {
        console.log('Success: ConnectPlaidInstitutionMutation');
        this.handleConnected();
      },
    });
  }

  handleConnected() {
    if (document.location.pathname.indexOf('onboarding') !== -1)
      browserHistory.push('/onboarding/accounts');
    else
      browserHistory.push('/app/accounts');
  }

  render() {
    const { viewer, relay } = this.props;
    const { results } = this.state;

    return (
      <CardList className={styles.root}>
        <Card>
          <TextInput label='Bank Search' onChange={this.handleSearch}/>
        </Card>

        <Transition show={!!viewer.finicityInstitution}>
          <FinicityAccountDialog
            viewer={viewer}
            finicityInstitution={viewer.finicityInstitution}
            onRequestClose={()=> relay.setVariables({ selectedFinicityId: null })}
            onConnected={::this.handleConnected}
          />
        </Transition>

        {viewer.finicityInstitutions ? viewer.finicityInstitutions.edges.map(({ node })=>
          <Card
            key={node.id}
            className='fi'
            onClick={()=> relay.setVariables({ selectedFinicityId: node.id })}
          >
            <div className='fi-name'><strong>{node.name}</strong></div>
            <div className='fi-domain'>{parseUrl(node.url).hostname}</div>
          </Card>
        ) : null}

        {results.length ? results.map((fi)=> (
          <Card
            className={`fi ${fi.logo ? 'has-logo' : ''}`}
            onClick={this.selectPlaid.bind(this, fi)}
            key={fi.id}
            style={{ borderLeftColor: fi.colors.darker }}
          >
            {fi.logo ? <img src={`data:image/png;base64,${fi.logo}`} alt={fi.name}/> : null}

            <div className='fi-name'>
              <strong>{fi.nameBreak ? fi.name.slice(0, fi.nameBreak) : fi.name}</strong><br/>
              {fi.nameBreak ? fi.name.slice(fi.nameBreak) : null}
            </div>
            <div className='fi-domain'>{parseUrl(fi.accountSetup).hostname}</div>
          </Card>
        )) : null}

      </CardList>
    );
  }
}


ConnectAccount = Relay.createContainer(ConnectAccount, {
  initialVariables: {
    query: null,
    selectedFinicityId: null,
  },
  prepareVariables(vars) {
    return {
      hasQuery: !!vars.query,
      selectedFinicity: !!vars.selectedFinicityId,
      ...vars,
    };
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${ConnectPlaidInstitutionMutation.getFragment('viewer')}
        ${FinicityAccountDialog.getFragment('viewer')}

        finicityInstitutions(query: $query, first: 10) @include(if: $hasQuery) {
          edges {
            node {
              id
              name
              url
            }
          }
        }

        finicityInstitution(id: $selectedFinicityId) @include(if: $selectedFinicity) {
          ${FinicityAccountDialog.getFragment('finicityInstitution')}
        }
      }
    `,
  },
});

export default ConnectAccount;
