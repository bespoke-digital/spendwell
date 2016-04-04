
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
      publicToken: this.props.publicToken,
      plaidInstitutionId: this.props.plaidInstitutionId,
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


export class SyncInstitutionMutation extends Relay.Mutation {
  static fragments = {
    institution: ()=> Relay.QL`
      fragment on InstitutionNode {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { syncInstitution }`;
  }

  getVariables() {
    return { institutionId: this.props.institution.id };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on SyncInstitutionMutation {
        institution {
          lastSync
          accounts
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        institution: this.props.institution.id,
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
