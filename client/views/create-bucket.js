
import { Component, PropTypes } from 'react';
import { Form } from 'formsy-react';

import Button from 'components/button';
import Card from 'components/card';
import Input from 'components/forms/input';
import styles from 'sass/views/create-bucket.scss';


export default class CreateBucket extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = { valid: false };
  }

  handleSubmit(data) {
    Meteor.call(
      'bucketsAdd',
      Object.assign({ type: this.props.location.query.type }, data),
      (error, bucketId)=> {
        if (error) throw error;
        this.props.history.push({ pathname: `/buckets/${bucketId}` });
      }
    );
  }

  render() {
    const { valid } = this.state;
    const { location } = this.props;

    return (
      <div className={`container ${styles.root}`}>
        <h1>
          New
          {location.query.type === 'outgoing' ? ' Outgoing ' : ' Savings '}
          Bucket
        </h1>

        <Card>
          <Form
            onValidSubmit={::this.handleSubmit}
            onValid={this.setState.bind(this, { valid: true })}
            onInvalid={this.setState.bind(this, { valid: false })}
            ref='form'
          >
            <Input layout='vertical' label='Name' name='name' required/>

            <Button type='submit' variant='primary' disabled={!valid}>
              Next
            </Button>

            <Button to='/app/'>Cancel</Button>

          </Form>
        </Card>

      </div>
    );
  }
}
