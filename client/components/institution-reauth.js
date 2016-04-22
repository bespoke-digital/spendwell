
import { Component } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import Container from 'components/container';


class InstitutionReauth extends Component {
  render() {
    const { viewer } = this.props;

    return (
      <Container>
        {viewer.institutions ? viewer.institutions.edges.map(({ node })=>
          <Card>
            Your {node.name} connection requires reauthorization.
          </Card>
        ) : null}
      </Container>
    );
  }
}

InstitutionReauth = Relay.createContainer(InstitutionReauth, {
  fragments: {
    viewer() {
      return Relay.QL`
        fragment on Viewer {
          institutions(first: 100, reauthRequired: true) {
            edges {
              node {
                name
              }
            }
          }
        }
      `;
    },
  },
});

export default InstitutionReauth;
