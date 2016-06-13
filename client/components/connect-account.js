
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


// const PLAID_PRODUCTION = document.querySelector('meta[name=plaid-production]').getAttribute('content') === 'true';


class ConnectAccount extends Component {
  constructor() {
    super();
    this.state = { results: [] };
    this.handleSearch = _.debounce(this.handleSearch.bind(this), 300);
  }

  handleSearch(query) {
    const { relay } = this.props;

    relay.setVariables({ query });

    // fetch(`https://${PLAID_PRODUCTION ? 'api' : 'tartan'}.plaid.com` +
    //     `/institutions/search?p=connect&q=${query}`)
    //   .then((response)=> response.json())
    //   .then((results)=> this.setState({ results }));
  }

  handleConnected() {
    if (document.location.pathname.indexOf('onboarding') !== -1)
      browserHistory.push('/onboarding/accounts');
    else
      browserHistory.push('/app/accounts');
  }

  selectPlaidInstitution(plaidId) {
    const { viewer } = this.props;
    plaidAccountDialog({
      viewer,
      plaidInstitutionId: plaidId,
      onConnected: ::this.handleConnected,
    });
  }

  handleTemplateClick(institutionTemplate) {
    const { relay } = this.props;

    if (institutionTemplate.finicityId)
      relay.setVariables({ finicitySelectedId: institutionTemplate.id });
    else if (institutionTemplate.plaidId)
      this.selectPlaidInstitution(institutionTemplate.plaidId);
  }

  parsedUrl(url) {
    if (!url)
      return;

    const hostname = parseUrl(url).hostname;

    if (hostname === parseUrl('').hostname)
      return url;

    return hostname;
  }

  render() {
    const { viewer, relay } = this.props;
    const { results } = this.state;

    return (
      <CardList className={styles.root}>
        <Card>
          <TextInput
            label='Choose bank below or search here'
            onChange={this.handleSearch}
          />
        </Card>

        <Transition show={!!viewer.institutionTemplate}>
          <FinicityAccountDialog
            viewer={viewer}
            institutionTemplate={viewer.institutionTemplate}
            onRequestClose={()=> relay.setVariables({ finicitySelectedId: null })}
            onConnected={::this.handleConnected}
          />
        </Transition>

        {viewer.institutionTemplates ? viewer.institutionTemplates.edges.map(({ node })=>
          <Card
            key={node.id}
            className='fi'
            className={`fi ${node.image ? 'has-logo' : ''}`}
            onClick={this.handleTemplateClick.bind(this, node)}
            style={{ borderLeftColor: node.color }}
          >
            {node.image ? <img src={node.image} alt={node.name}/> : null}
            <div className='fi-name'><strong>{node.name}</strong></div>
            <div className='fi-domain'>{this.parsedUrl(node.url)}</div>
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
    finicitySelectedId: null,
  },
  prepareVariables(vars) {
    return {
      finicitySelected: !!vars.finicitySelectedId,
      ...vars,
    };
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${FinicityAccountDialog.getFragment('viewer')}
        ${ConnectPlaidInstitutionMutation.getFragment('viewer')}

        institutionTemplates(query: $query, first: 12) {
          edges {
            node {
              id
              finicityId
              plaidId
              name
              url
              image
              color
            }
          }
        }

        institutionTemplate(id: $finicitySelectedId) @include(if: $finicitySelected) {
          ${FinicityAccountDialog.getFragment('institutionTemplate')}
        }
      }
    `,
  },
});

export default ConnectAccount;
