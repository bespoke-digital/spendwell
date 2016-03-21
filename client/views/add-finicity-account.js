
import { Component } from 'react';
import Relay from 'react-relay';

import CardList from 'components/card-list';
import Card from 'components/card';
import TextInput from 'components/text-input';
import Button from 'components/button';
import App from 'components/app';


class AddFinicityAccount extends Component {
  constructor() {
    super();
    this.state = { credentials: {} };
  }

  setFormValue(field, value) {
    const { credentials } = this.state;

    this.setState({
      credentials: Object.assign({}, credentials, { [field]: value }),
    });
  }

  handleSubmit() {
    const { relay, viewer } = this.props;
    const { credentials } = this.state;
    relay.setVariables({
      institutionId: viewer.finicityInstitution.finicityId,
      credentials: JSON.stringify(credentials),
    });
  }

  render() {
    const { viewer } = this.props;

    console.log(viewer.finicityInstitution.loginForm);

    return (
      <App viewer={viewer}>
        <div className='container skinny'>
          <h1>Connect {viewer.finicityInstitution.name}</h1>
          <CardList>
            {viewer.finicityInstitution.loginForm.map((field)=>
              <Card key={field.name}>
                <TextInput
                  label={field.description}
                  onChange={this.setFormValue.bind(this, field.name)}
                  type={field.name.indexOf('Password') !== -1 ? 'password' : undefined}
                />
              </Card>
            )}
          </CardList>

          <div className='flex-row'>
            <div/>
            <Button variant='primary' onClick={::this.handleSubmit}>Submit</Button>
          </div>
        </div>
      </App>
    );
  }
}


AddFinicityAccount = Relay.createContainer(AddFinicityAccount, {
  initialVariables: {
    id: null,
    credentials: null,
    institutionId: null,
  },
  prepareVariables: (vars)=> ({
    credentialsReady: !!vars.credentials,
    ...vars,
  }),
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}

        finicityInstitution(id: $id) {
          id
          finicityId
          name

          loginForm {
            name
            value
            description
            displayOrder
            mask
            valueLengthMin
            valueLengthMax
            instructions
          }
        }

        finicityAccounts(credentials: $credentials, institutionId: $institutionId) @include(if: $credentialsReady) {
          id
          name
        }
      }
    `,
  },
});

export default AddFinicityAccount;
