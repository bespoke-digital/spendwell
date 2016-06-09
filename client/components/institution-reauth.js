
import { Component } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import TextActions from 'components/text-actions';
import A from 'components/a';
import Transition from 'components/transition';
import FinicityAccountDialog from 'components/finicity-account-dialog';
import Icon from 'components/icon';

import { ConnectPlaidInstitutionMutation } from 'mutations/institutions';
import plaidAccountDialog from 'utils/plaid-account-dialog';

import style from 'sass/components/institution-reauth';

class InstitutionReauth extends Component {
  state = {
    loading: false,
    canceled: false,
  };

  reauth(institution) {
    const { viewer, relay } = this.props;

    this.setState({ canceled: false });

    if (institution.plaidId)
      plaidAccountDialog({
        viewer,
        plaidInstitutionId: institution.plaidId,
        plaidPublicToken: institution.plaidPublicToken,
        fullSync: true,
        onConnecing: ()=> this.setState({ loading: true }),
        onConnected: ()=> {
          relay.forceFetch();
          this.setState({ loading: false });
        },
      });

    else if (institution.finicityId)
      this.setState({ finicityConnect: institution });

    else
      console.warn('Cannot reauth an unknown institution type');
  }

  handleFinicityConnected() {
    const { relay } = this.props;
    relay.forceFetch();
    this.setState({ finicityConnect: null, loading: false });
  }

  render() {
    const { viewer } = this.props;
    const { finicityConnect, loading, canceled } = this.state;

    if (!viewer.institutions || viewer.institutions.edges.length === 0)
      return null;

    return (
      <div className={style.root}>
        <Transition show={!canceled && !!(finicityConnect && finicityConnect.institutionTemplate)}>
          <FinicityAccountDialog
            viewer={viewer}
            institutionTemplate={finicityConnect ? finicityConnect.institutionTemplate : null}
            onRequestClose={()=> this.setState({ canceled: true, loading: false })}
            onConnecing={()=> this.setState({ loading: true })}
            onConnected={::this.handleFinicityConnected}
            fullSync
          />
        </Transition>

        {viewer.institutions.edges.map(({ node })=>
          <Card key={node.id}>
            <div className='icon-row'>
              <div><Icon type='warning'/></div>
              <div>
                {!loading ?
                  <span>
                    Your {node.name} connection requires reauthorization.
                    <TextActions>
                      <A onClick={this.reauth.bind(this, node)}>Reauthorize</A>
                    </TextActions>
                  </span>
                :
                  <span>Syncing your data...</span>
                }
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }
}

InstitutionReauth = Relay.createContainer(InstitutionReauth, {
  fragments: {
    viewer() {
      return Relay.QL`
        fragment on Viewer {
          ${ConnectPlaidInstitutionMutation.getFragment('viewer')}
          ${FinicityAccountDialog.getFragment('viewer')}

          institutions(first: 100, reauthRequired: true) {
            edges {
              node {
                id
                name
                plaidId
                plaidPublicToken
                finicityId

                institutionTemplate {
                  ${FinicityAccountDialog.getFragment('institutionTemplate')}
                }
              }
            }
          }
        }
      `;
    },
  },
});

export default InstitutionReauth;
