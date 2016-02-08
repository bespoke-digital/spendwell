
import Relay from 'react-relay';


export class AddInstitutionMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { addInstitution }`;
  }

  getVariables() {
    return { name: this.props.name };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on AddInstitutionMutation {
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
