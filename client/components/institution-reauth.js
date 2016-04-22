
import { Component } from 'react';
import Relay from 'react-relay';

import Container from 'components/container';
import Card from 'components/card';
import TextActions from 'components/text-actions';
import A from 'components/a';

import { ConnectPlaidInstitutionMutation } from 'mutations/institutions';
import plaidAccountDialog from 'utils/plaid-account-dialog';


class InstitutionReauth extends Component {
  reauth(institution) {
    const { viewer, relay } = this.props;

    if (institution.plaidId)
      plaidAccountDialog(institution.plaidId, viewer, ()=> {
        relay.forceFetch();
      }, true);
    else
      console.warn('Cannot reauth an unknown institution type');
  }

  render() {
    const { viewer } = this.props;

    if (!viewer.institutions || viewer.institutions.edges.length === 0)
      return null;

    return (
      <Container>
        {viewer.institutions.edges.map(({ node })=>
          <Card key={node.id}>
            Your {node.name} connection requires reauthorization.
            <TextActions>
              <A onClick={this.reauth.bind(this, node)}>Reauthorize</A>
            </TextActions>
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

          institutions(first: 100, reauthRequired: true) {
            edges {
              node {
                id
                name
                plaidId
              }
            }
          }
        }
      `;
    },
  },
});

export default InstitutionReauth;
