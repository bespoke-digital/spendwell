
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form } from 'formsy-react';

import { createBucket } from 'state/buckets';
import Button from 'components/button';
import Card from 'components/card';
import Input from 'components/forms/input';
import styles from 'sass/views/create-bucket.scss';


class CreateBucket extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    create: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = { buttonEnabled: false };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.create.failed === false && nextProps.create.bucket) {
      nextProps.history.pushState(null, `/buckets/${nextProps.create.bucket.id}`);
    }
  }

  handleSubmit(data) {
    this.props.dispatch(createBucket(data));
  }

  render() {
    return (
      <div className={`container ${styles.root}`}>
        <h1>Create Bucket</h1>

        <Card>
          <Form
            onValidSubmit={::this.handleSubmit}
            onValid={this.setState.bind(this, { buttonEnabled: true })}
            onInvalid={this.setState.bind(this, { buttonEnabled: false })}
            ref='form'
          >
            <Input layout='vertical' label='Name' name='name' required/>
            <Input
              label='Monthly Amount'
              name='monthly_amount'
              validators='isNumeric'
              required
            />

            <Button
              type='submit'
              variant='primary'
              disabled={!this.state.buttonEnabled || this.props.create.loading}
            >
              Next
              {this.props.create.loading ? (
                <i className='fa fa-spinner fa-spin'/>
              ) : null}
            </Button>

          </Form>
        </Card>

      </div>
    );
  }
}

export default connect((state)=> ({
  create: state.buckets.create,
}))(CreateBucket);
