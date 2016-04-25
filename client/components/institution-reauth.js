
import { Component } from 'react';
import Relay from 'react-relay';

import Container from 'components/container';
import Card from 'components/card';
import TextActions from 'components/text-actions';
import A from 'components/a';
import Transition from 'components/transition';
import FinicityAccountDialog from 'components/finicity-account-dialog';
import WarningIcon from 'components/icons/warning-icon';

import { ConnectPlaidInstitutionMutation } from 'mutations/institutions';
import plaidAccountDialog from 'utils/plaid-account-dialog';


class InstitutionReauth extends Component {
  state = {};

  reauth(institution) {
    const { viewer, relay } = this.props;

    if (institution.plaidId)
      plaidAccountDialog(institution.plaidId, viewer, ()=> relay.forceFetch(), true);

    else if (institution.finicityId)
      this.setState({ finicityConnect: institution });

    else
      console.warn('Cannot reauth an unknown institution type');
  }

  handleFinicityConnected() {
    const { relay } = this.props;
    relay.forceFetch();
    this.setState({ finicityConnect: null });
  }

  render() {
    const { viewer } = this.props;
    const { finicityConnect } = this.state;

    if (!viewer.institutions || viewer.institutions.edges.length === 0)
      return null;

    return (
      <Container>
        <Transition show={!!(finicityConnect && finicityConnect.finicityInstitution)}>
          <FinicityAccountDialog
            viewer={viewer}
            finicityInstitution={finicityConnect ? finicityConnect.finicityInstitution : null}
            onRequestClose={()=> this.setState({ finicityInstitution: null })}
            onConnected={::this.handleFinicityConnected}
            fullSync
          />
        </Transition>

        {viewer.institutions.edges.map(({ node })=>
          <Card key={node.id}>
            <div className='icon-row'>
              <div><WarningIcon color='orange'/></div>
              <div>
                Your {node.name} connection requires reauthorization.
                <TextActions>
                  <A onClick={this.reauth.bind(this, node)}>Reauthorize</A>
                </TextActions>
              </div>
            </div>
          </Card>
        )}
      </Container>
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
                finicityId

                finicityInstitution {
                  ${FinicityAccountDialog.getFragment('finicityInstitution')}
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
