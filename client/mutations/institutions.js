
import Relay from 'react-relay';


export class ConnectInstitutionMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { connectInstitution }`;
  }

  getVariables() {
    return {
      publicToken: this.props.publicToken,
      institutionId: this.props.institution.id,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on ConnectInstitutionMutation {
        viewer { institutions }
        institutionEdge
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'viewer',
      parentID: this.props.viewer.id,
      connectionName: 'institutions',
      edgeName: 'institutionEdge',
      rangeBehaviors: { '': 'append' },
    }];
  }

  getOptimisticResponse() {
    return {
      institution: {
        name: this.props.name,
      },
    };
  }
}


export class CreateInstitutionMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { createInstitution }`;
  }

  getVariables() {
    return { name: this.props.name };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateInstitutionMutation {
        viewer { institutions }
        institutionEdge
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'viewer',
      parentID: this.props.viewer.id,
      connectionName: 'institutions',
      edgeName: 'institutionEdge',
      rangeBehaviors: { '': 'append' },
    }];
  }

  getOptimisticResponse() {
    return {
      institution: {
        name: this.props.name,
      },
    };
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