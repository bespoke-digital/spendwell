
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form } from 'formsy-react';
import { FormsyText } from 'formsy-material-ui';
import RaisedButton from 'material-ui/lib/raised-button';
import { Link } from 'react-router';

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
      nextProps.history.pushState(null, '/');
  }

  render() {
    return (
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
          <FormsyText floatingLabelText='Email' name='email' type='email' validations='isEmail' required/>
          <FormsyText floatingLabelText='Password' name='password' type='password' required/>

          <RaisedButton
            type='submit'
            primary={true}
            disabled={!this.state.buttonEnabled}
            label='Login'
          />
          <div className='auth-other'>Or <Link to='/signup'>Signup</Link></div>
        </Form>

      </div>
    );
  }
}

Login.propTypes = {
  auth: PropTypes.object.isRequired,
};

export default connect((state)=> ({ auth: state.auth }))(Login);
