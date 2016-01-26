
import { Component, PropTypes } from 'react';
import { Form } from 'formsy-react';

import Input from 'components/forms/input';
import Button from 'components/button';
import Card from 'components/card';
import styles from 'sass/views/login.scss';


export default class Login extends Component {
  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = { valid: false, errors: null };
  }

  componentDidMount() {
    if (Meteor.userId())
      Meteor.logout();
  }

  handleSubmit({ email, password }, reset, invalidate) {
    Meteor.loginWithPassword({ email }, password, (error)=> {
      if (error && error.reason === 'User not found')
        return invalidate({ email: true });

      else if (error && error.reason === 'Incorrect password')
        return invalidate({ password: true });

      else if (error)
        throw error;

      this.props.history.push({ pathname: '/' });
    });
  }

  render() {
    const { errors, valid } = this.state;
    if (errors) console.log(errors);
    return (
      <div className={`container ${styles.root}`}>
        <h1>Login</h1>

        <Card>
          <Form
            onValidSubmit={::this.handleSubmit}
            onValid={this.setState.bind(this, { valid: true })}
            onInvalid={this.setState.bind(this, { valid: false })}
          >
            <Input label='Email' name='email' type='email' validations='isEmail' required/>
            <Input label='Password' name='password' type='password' required/>

            {errors ? (
              <p className='mui--text-danger'>TODO: fix this error</p>
            ) : null}

            <Button type='submit' variant='primary' disabled={!valid}>Login</Button>
            <Button to='/signup'>Signup</Button>
          </Form>
        </Card>

      </div>
    );
  }
}
