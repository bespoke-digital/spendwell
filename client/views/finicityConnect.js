
import { Component, PropTypes } from 'react';
import { Form } from 'formsy-react';

import CardList from 'components/card-list';
import Card from 'components/card';
import Button from 'components/button';
import Loading from 'components/loading';
import Input from 'components/forms/input';

import styles from 'sass/views/finicityConnect.scss';


export default class FinicityConnect extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = { selected: {} };
  }

  componentWillMount() {
    const { institutionId } = this.props.params;

    Meteor.call('finicityInstitution', institutionId, (error, institution)=> {
      if (error) throw error;
      this.setState({ institution });
    });

    Meteor.call('finicityLoginForm', institutionId, (error, loginForm)=> {
      if (error) throw error;
      this.setState({ loginForm });
    });
  }

  submitCreds(creds) {
    const { institution, loginForm } = this.state;

    Meteor.call('finicityListAccounts', {
      institutionId: institution.id,
      loginForm,
      creds,
    }, (error, accounts)=> {
      if (error) throw error;
      this.setState({ accounts });
    });
  }

  toggleSelect(account) {
    const { selected } = this.state;
    selected[account.id] = !selected[account.id];
    this.setState({ selected });
  }

  addAccounts() {
    const { institution, selected, accounts } = this.state;
    const { history } = this.props;

    Meteor.call('finicityAddAccounts', {
      institutionId: institution.id,
      accounts: accounts.filter(({ id })=> selected[id]),
    }, (error)=> {
      if (error) throw error;

      console.log('success!!');
      history.pushState(null, '/');
    });
  }

  render() {
    const { institution, loginForm, accounts, selected } = this.state;

    if (!institution || !loginForm)
      return <Loading/>;

    console.log('accounts', accounts);

    return (
      <div className={`container ${styles.root}`}>
        <h1>Connect {institution.name}</h1>

        {!accounts ? (
          <Card>
            <Form onValidSubmit={this.submitCreds.bind(this)}>
              {loginForm.loginField.map((field, index)=>
                <Input key={index} name={field.id} label={field.name}/>
              )}
              <Button type='submit' variant='primary'>Submit</Button>
            </Form>
          </Card>
        ) : [
          <CardList key='accounts'>
            {accounts.map((account)=> (
              <Card
                key={account.id}
                className='account'
                onClick={this.toggleSelect.bind(this, account)}
              >
                <div className='summary'>
                  <div>
                    <i className={`fa fa-${selected[account.id] ? 'check-' : ''}square-o`}/>
                  </div>
                  <div className='left'>{account.name}</div>
                  <div>{account.balance}</div>
                </div>
              </Card>
            ))}
          </CardList>,
          <Button
            key='submit'
            onClick={::this.addAccounts}
            variant='primary'
          >
            Connect Accounts
          </Button>,
        ]}
      </div>
    );
  }
}
