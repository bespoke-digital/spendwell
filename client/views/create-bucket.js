
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form } from 'formsy-react';
import { Input } from 'formsy-react-components';

import { create } from 'state/buckets';
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

  handleSubmit(data) {
    this.props.dispatch(create(data));
  }

  render() {
    return (
      <div className={`container ${styles.root}`}>
        <h1>Create Bucket</h1>

        <Form
          onValidSubmit={::this.handleSubmit}
          onValid={this.setState.bind(this, { buttonEnabled: true })}
          onInvalid={this.setState.bind(this, { buttonEnabled: false })}
          ref='form'
        >
          <Input layout='vertical' label='Name' name='name' required/>

          <button
            type='submit'
            className='btn btn-primary'
            disabled={!this.state.buttonEnabled || this.props.create.loading}
          >
            Save
            {this.props.create.loading ? (
              <i className='fa fa-spinner fa-spin'/>
            ) : null}
          </button>

        </Form>

        { this.props.create.bucket ? (
          'Done!'
        ) : null }

      </div>
    );
  }
}

export default connect((state)=> ({
  create: state.buckets.create,
}))(CreateBucket);
