
import Relay from 'react-relay';


export class ConnectFinicityInstitutionMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id
      }
    `,
    finicityInstitution: ()=> Relay.QL`
      fragment on FinicityInstitutionNode {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { connectFinicityInstitution }`;
  }

  getVariables() {
    const { finicityInstitution, credentials, mfaAnswers, fullSync } = this.props;

    return {
      finicityInstitutionId: finicityInstitution.id,
      credentials: JSON.stringify(credentials),
      mfaAnswers: mfaAnswers ? JSON.stringify(mfaAnswers) : null,
      fullSync,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on ConnectFinicityInstitutionMutation {
        viewer {
          safeToSpend
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
