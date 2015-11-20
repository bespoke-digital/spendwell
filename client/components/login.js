
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form } from 'formsy-react';
import { Input } from 'formsy-react-components';
import _ from 'lodash';

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

    if (nextProps.auth.login.failed) {
      const errors = _.clone(nextProps.auth.login.response);
      if (errors.non_field_errors)
        delete errors.non_field_errors;

      this.refs.form.updateInputsWithError(errors);
    }
  }

  render() {
    return (
      <div>
        <Header/>
        <div className={`container ${styles.root}`}>
          <h1>Login</h1>

          { this.props.auth.login.failed && this.props.auth.login.response.non_field_errors ? (
            this.props.auth.login.response.non_field_errors.map((error, i)=> (
              <div ket={i} className='alert alert-danger'>{ error }</div>
            ))
          ) : null}

          <Form
            onValidSubmit={::this.handleSubmit}
            onValid={this.setState.bind(this, { buttonEnabled: true })}
            onInvalid={this.setState.bind(this, { buttonEnabled: false })}
            ref='form'
          >
            <Input layout='vertical' label='Email' name='email' type='email' validations='isEmail' required/>
            <Input layout='vertical' label='Password' name='password' type='password' required/>

            <button
              type='submit'
              className='btn btn-primary'
              disabled={!this.state.buttonEnabled}
            >
              Login
              {this.props.auth.login.loading ? (
                <i className='fa fa-spinner fa-spin'/>
              ) : null}
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
