
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
    this.state = { data: {} };
  }

  setFormValue(field, value) {
    const { data } = this.state;
    this.setState({ data: Object.assign({}, data, { field: value }) });
  }

  handleSubmit() {
    const { viewer } = this.props;
    const { data } = this.state;

    Relay.Store.commitUpdate(new ConnectFinicityInstitutionMutation(), {
      onFailure: ()=> console.log('Failure: ConnectFinicityInstitutionMutation'),
      onSuccess: ()=> {
        console.log('Success: ConnectFinicityInstitutionMutation');

        if (document.location.pathname.indexOf('onboarding') !== -1)
          browserHistory.push('/app/onboarding/accounts');
        else
          browserHistory.push('/app/accounts');
      },
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
              <Card>
                <TextInput
                  label={field.description}
                  onChange={this.setFormValue.bind(this, field.name)}
                />
              </Card>
            )}
          </CardList>

          <div className='flex-row'>
            <div/>
            <Button variant='primary'>Submit</Button>
          </div>
        </div>
      </App>
    );
  }
}


AddFinicityAccount = Relay.createContainer(AddFinicityAccount, {
  initialVariables: { id: null },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}

        finicityInstitution(id: $id) {
          id
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
      }
    `,
  },
});

export default AddFinicityAccount;
