
import _ from 'lodash';
import { Component } from 'react';
import Relay from 'react-relay';

import CardList from 'components/card-list';
import Card from 'components/card';
import TextInput from 'components/text-input';
import Button from 'components/button';
import Money from 'components/money';
import Icon from 'components/icon';
import App from 'components/app';


class AddFinicityAccount extends Component {
  constructor() {
    super();
    this.state = { credentials: {}, disabledAccounts: {}, loading: false };
  }

  setFormValue(name, id, value) {
    const { credentials } = this.state;

    this.setState({
      credentials: Object.assign({}, credentials, { [id]: { value, name } }),
    });
  }

  toggleAccount(account) {
    const { disabledAccounts } = this.state;

    this.setState({
      disabledAccounts: Object.assign(disabledAccounts, { [account.id]: !disabledAccounts[account.id] }),
    });
  }

  handleSubmit() {
    const { relay, viewer } = this.props;
    const { credentials } = this.state;

    if (!viewer.finicityAccounts) {
      this.setState({ loading: true });
      relay.setVariables({
        institutionId: viewer.finicityInstitution.finicityId,
        credentials: JSON.stringify(credentials),
      }, ({ done, error })=> this.setState({ loading: !(done || error) }));

    } else {
      console.log('TODO: connect accounts');
    }
  }

  render() {
    const { viewer } = this.props;
    const { disabledAccounts, loading } = this.state;

    const formFields = _.sortBy(viewer.finicityInstitution.loginForm, 'displayOrder');

    console.log('loading', loading);

    return (
      <App viewer={viewer}>
        <div className='container skinny'>
          <h1>Connect {viewer.finicityInstitution.name}</h1>

          {!viewer.finicityAccounts ?
            <CardList>
              {formFields.map((field)=>
                <Card key={field.name}>
                  <TextInput
                    label={field.description}
                    onChange={this.setFormValue.bind(this, field.name, field.id)}
                    type={field.name.indexOf('Password') !== -1 ? 'password' : 'text'}
                  />
                </Card>
              )}
            </CardList>
          :
            <CardList>
              <Card className='card-list-heading' summary={
                <div>
                  <div/>
                  <div className='fw'>Balance</div>
                  <div className='fw'>Enabled</div>
                </div>
              }/>
              {viewer.finicityAccounts.map((account)=>
                <Card key={account.id} summary={
                  <div>
                    <div>{account.name}</div>
                    <div className='fw'><Money amount={account.balance}/></div>
                    <Button className='fw' onClick={this.toggleAccount.bind(this, account)}>
                      <Icon
                        fixedWidth
                        type={disabledAccounts[account.id] ? 'square-o' : 'check-square-o'}
                      />
                    </Button>
                  </div>
                }/>
              )}
            </CardList>
          }

          <div className='flex-row'>
            <div/>
            <Button variant='primary' onClick={::this.handleSubmit} loading={loading}>
              {!viewer.finicityAccounts ? 'Submit' : 'Save'}
            </Button>
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
            id
            name
            description
            displayOrder
          }
        }

        finicityAccounts(credentials: $credentials, institutionId: $institutionId) @include(if: $credentialsReady) {
          id
          name
          balance
        }
      }
    `,
  },
});

export default AddFinicityAccount;
