
import Relay from 'react-relay';
import { Component } from 'react';
import { browserHistory } from 'react-router';

import Button from 'components/button';
import BucketForm from 'components/bucket-form';
import App from 'components/app';

import { CreateBucketMutation } from 'mutations/buckets';

import styles from 'sass/views/create-bucket.scss';


class CreateBill extends Component {
  constructor() {
    super();
    this.state = { loading: false };
  }

  handleSubmit({ filters, name }) {
    const { viewer } = this.props;

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new CreateBucketMutation({ viewer, name, filters, type: 'bill' }), {
      onFailure: ()=> {
        console.log('Failure: CreateBucketMutation');
        this.setState({ loading: false });
      },
      onSuccess: ()=> {
        console.log('Success: CreateBucketMutation');
        this.setState({ loading: false });
        browserHistory.push('/app/dashboard');
      },
    });
  }

  render() {
    const { viewer } = this.props;
    const { loading } = this.state;

    return (
      <App viewer={viewer}>
        <div className={`container ${styles.root}`}>
          <div className='heading'>
            <Button onClick={()=> browserHistory.push('/app/dashboard')} className='back'>
              <i className='fa fa-long-arrow-left'/>
            </Button>

            <h1>New Bill</h1>
          </div>

          <BucketForm
            onSubmit={::this.handleSubmit}
            onCancel={()=> browserHistory.goBack()}
            viewer={viewer}
            bucket={null}
            loading={loading}
          />
        </div>
      </App>
    );
  }
}

CreateBill = Relay.createContainer(CreateBill, {
  initialVariables: {
    filters: [],
    count: 50,
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        ${CreateBucketMutation.getFragment('viewer')}
        ${BucketForm.getFragment('viewer')}
      }
    `,
  },
});

export default CreateBill;
