
import { Component } from 'react';
import { Form } from 'formsy-react';

import Input from 'components/forms/input';
import Button from 'components/button';
import Card from 'components/card';
import styles from 'sass/views/signup.scss';


export default class Signup extends Component {
  constructor() {
    super();
    this.state = { valid: false, errors: null };
  }

  handleSubmit({ email, password }) {
    Accounts.createUser({ email, password }, (error)=> {
      if (error) throw error;

      this.props.history.push({ pathname: '/' });
    });
  }

  render() {
    const { errors, valid } = this.state;
    if (errors) console.log(errors);
    return (
      <div className={`container ${styles.root}`}>
        <h1>Signup</h1>

        <Card>
          <Form
            onValidSubmit={::this.handleSubmit}
            onValid={this.setState.bind(this, { valid: true })}
            onInvalid={this.setState.bind(this, { valid: false })}
          >
            <Input label='Email' name='email' type='email' validations='isEmail' required/>
            <Input label='Password' name='password' type='password' required/>
            <Input
              label='Password (Confirm)'
              name='password_confirm'
              type='password'
              validations='equalsField:password'
              required
            />

            {errors ? (
              <p className='mui--text-danger'>TODO: fix this error</p>
            ) : null}

            <Button type='submit' variant='primary' disabled={!valid}>Signup</Button>
            <Button to='/login'>Login</Button>
          </Form>
        </Card>

      </div>
    );
  }
}
