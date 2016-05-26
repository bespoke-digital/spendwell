
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
import plaidAccountDialog from 'utils/plaid-account-dialog';
import { parseUrl } from 'utils';

import styles from 'sass/views/add-plaid.scss';


const PLAID_PRODUCTION = document.querySelector('meta[name=plaid-production]').getAttribute('content') === 'true';


class ConnectAccount extends Component {
  constructor() {
    super();
    this.state = { results: [] };
    this.handleSearch = _.debounce(this.handleSearch.bind(this), 300);
  }

  handleSearch(query) {
    const { relay } = this.props;

    relay.setVariables({ query });

    fetch(`https://${PLAID_PRODUCTION ? 'api' : 'tartan'}.plaid.com` +
        `/institutions/search?p=connect&q=${query}`)
      .then((response)=> response.json())
      .then((results)=> this.setState({ results }));
  }

  handleConnected() {
    if (document.location.pathname.indexOf('onboarding') !== -1)
      browserHistory.push('/onboarding/accounts');
    else
      browserHistory.push('/app/accounts');
  }

  selectPlaidInstitution(plaidInstitution) {
    const { viewer } = this.props;
    plaidAccountDialog({
      viewer,
      plaidInstitutionId: plaidInstitution.id,
      onConnected: ::this.handleConnected,
      logo: plaidInstitution.logo,
    });
  }

  render() {
    const { viewer, relay } = this.props;
    const { results } = this.state;

    console.log(results);

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
            className={`fi ${node.image ? 'has-logo' : ''}`}
            onClick={()=> relay.setVariables({ selectedFinicityId: node.id })}
            style={{ borderLeftColor: node.color }}
          >
            {node.image ? <img src={node.image} alt={node.name}/> : null}
            <div className='fi-name'><strong>{node.name}</strong></div>
            <div className='fi-domain'>{parseUrl(node.url).hostname}</div>
          </Card>
        ) : null}

        {results.length ? results.map((plaidInstitution)=> (
          <Card
            className={`fi ${plaidInstitution.logo ? 'has-logo' : ''}`}
            onClick={()=> this.selectPlaidInstitution(plaidInstitution)}
            key={plaidInstitution.id}
            style={{ borderLeftColor: plaidInstitution.colors.darker }}
          >
            {plaidInstitution.logo ?
              <img src={`data:image/png;base64,${plaidInstitution.logo}`} alt={plaidInstitution.name}/>
            : null}

            <div className='fi-name'>
              <strong>{plaidInstitution.nameBreak ?
                plaidInstitution.name.slice(0, plaidInstitution.nameBreak)
                :
                plaidInstitution.name
              }</strong><br/>
              {plaidInstitution.nameBreak ?
                plaidInstitution.name.slice(plaidInstitution.nameBreak)
              : null}
            </div>
            <div className='fi-domain'>{parseUrl(plaidInstitution.accountSetup).hostname}</div>
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
        ${FinicityAccountDialog.getFragment('viewer')}
        ${ConnectPlaidInstitutionMutation.getFragment('viewer')}

        finicityInstitutions(query: $query, first: 10) @include(if: $hasQuery) {
          edges {
            node {
              id
              name
              url
              image
              color
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
