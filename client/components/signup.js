
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form } from 'formsy-react';
import { Input } from 'formsy-react-components';
import { Link } from 'react-router';

import { signup } from 'state/auth';
import styles from 'sass/components/signup.scss';


class Signup extends Component {
  constructor() {
    super();
    this.state = { fields: {}, buttonEnabled: false };
  }

  handleSubmit(data) {
    this.props.dispatch(signup(data));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.authenticated)
      nextProps.history.pushState(null, '/');
  }

  render() {
    return (
      <div className={`container ${styles.root}`}>
        <h1>Sign Up</h1>

        { this.props.auth.signup.error ? (
          <div className='alert alter-danger'>
            { this.props.auth.signup.error }
          </div>
        ) : null}

        <Form
          onValidSubmit={::this.handleSubmit}
          onValid={this.setState.bind(this, { buttonEnabled: true })}
          onInvalid={this.setState.bind(this, { buttonEnabled: false })}
        >
          <Input layout='vertical' label='Name' name='name' required/>
          <Input layout='vertical' label='Email' name='email' type='email' validations='isEmail' required/>
          <Input layout='vertical' label='Password' name='password' type='password' required/>

          <button
            type='submit'
            className='btn btn-primary'
            disabled={!this.state.buttonEnabled}
          >
            Sign Up
          </button>

          <div className='auth-other'>Or <Link to='/login'>Login</Link></div>
        </Form>

      </div>
    );
  }
}

Signup.propTypes = {
  auth: PropTypes.object.isRequired,
};

export default connect((state)=> ({ auth: state.auth }))(Signup);
