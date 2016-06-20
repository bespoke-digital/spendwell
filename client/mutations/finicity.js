
import Relay from 'react-relay'


export class ConnectFinicityInstitutionMutation extends Relay.Mutation {
  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
      }
    `,
    institutionTemplate: () => Relay.QL`
      fragment on InstitutionTemplateNode {
        finicityId
      }
    `,
  };

  getMutation () {
    return Relay.QL`mutation { connectFinicityInstitution }`
  }

  getVariables () {
    const { institutionTemplate, credentials, mfaAnswers, sync } = this.props

    return {
      finicityId: institutionTemplate.finicityId,
      credentials: JSON.stringify(credentials),
      mfaAnswers: mfaAnswers ? JSON.stringify(mfaAnswers) : null,
      sync,
    }
  }

  getFatQuery () {
    return Relay.QL`
      fragment on ConnectFinicityInstitutionMutationPayload {
        viewer {
          dummy
        }
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }]
  }
}
