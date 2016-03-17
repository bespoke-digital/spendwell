
import Relay from 'react-relay';
import { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';

import BucketForm from 'components/bucket-form';
import App from 'components/app';

import { CreateBucketMutation } from 'mutations/buckets';

import styles from 'sass/views/create-bucket.scss';


class CreateBucket extends Component {
  static contextTypes = {
    router: PropTypes.object,
  };

  constructor() {
    super();
    this.state = { loading: false };
  }

  handleSubmit({ filters, name, reload }) {
    const { viewer } = this.props;

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new CreateBucketMutation({ viewer, name, filters, type: 'expense' }), {
      onFailure: ()=> {
        console.log('Failure: CreateBucketMutation');
        this.setState({ loading: false });
      },
      onSuccess: ()=> {
        console.log('Success: CreateBucketMutation');
        this.setState({ loading: false });

        // if (reload) TODO

        browserHistory.push('/app/dashboard');
      },
    });
  }

  render() {
    const { viewer } = this.props;
    const { loading } = this.state;

    return (
      <App viewer={viewer} back={true}>
        <div className={`container ${styles.root}`}>
          <div className='heading'>
            <h1>New Category</h1>
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

CreateBucket = Relay.createContainer(CreateBucket, {
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

export default CreateBucket;
