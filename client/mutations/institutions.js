
import Relay from 'react-relay';


export class ConnectPlaidInstitutionMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { connectPlaidInstitution }`;
  }

  getVariables() {
    return {
      fullSync: this.props.fullSync,
      publicToken: this.props.publicToken,
      plaidInstitutionId: this.props.plaidInstitutionId,
      logo: this.props.logo,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on ConnectPlaidInstitutionMutation {
        viewer {
          summary
          institutions
          accounts
          transactions
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }];
  }
}


export class SyncInstitutionsMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { syncInstitutions }`;
  }

  getVariables() {
    return {};
  }

  getFatQuery() {
    return Relay.QL`
      fragment on SyncInstitutionsMutation {
        viewer {
          institutions
          accounts
          transactions
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }];
  }
}
