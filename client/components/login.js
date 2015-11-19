
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form } from 'formsy-react';
import { Input } from 'formsy-react-components';
import { Link } from 'react-router';

import Header from './header';
import { login } from 'state/auth';
import styles from 'sass/components/login.scss';


class Login extends Component {
  constructor() {
    super();
    this.state = { fields: {}, buttonEnabled: false };
  }

  handleSubmit(data) {
    this.props.dispatch(login(data));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.authenticated)
      nextProps.history.pushState(null, this.props.next || '/dashboard');
  }

  render() {
    return (
      <div>
        <Header/>
        <div className={`container ${styles.root}`}>
          <h1>Login</h1>

          { this.props.auth.login.error ? (
            <div className='alert alter-danger'>
              { this.props.auth.login.error }
            </div>
          ) : null}

          <Form
            onValidSubmit={::this.handleSubmit}
            onValid={this.setState.bind(this, { buttonEnabled: true })}
            onInvalid={this.setState.bind(this, { buttonEnabled: false })}
          >
            <Input layout='vertical' label='Email' name='email' type='email' validations='isEmail' required/>
            <Input layout='vertical' label='Password' name='password' type='password' required/>

            <button
              type='submit'
              className='btn btn-primary'
              disabled={!this.state.buttonEnabled}
            >
              Login
            </button>
          </Form>

        </div>
      </div>
    );
  }
}

Login.propTypes = {
  auth: PropTypes.object.isRequired,
};

export default connect((state)=> ({ auth: state.auth }))(Login);
