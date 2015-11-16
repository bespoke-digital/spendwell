
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form } from 'formsy-react';
import { FormsyText } from 'formsy-material-ui';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/lib/raised-button';

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
          <FormsyText floatingLabelText='Name' name='name' required/>
          <FormsyText floatingLabelText='Email' name='email' type='email' validations='isEmail' required/>
          <FormsyText floatingLabelText='Password' name='password' type='password' required/>

          <RaisedButton
            type='submit'
            primary={true}
            disabled={!this.state.buttonEnabled}
            label='Sign Up'
          />

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
