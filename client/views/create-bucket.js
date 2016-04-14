
import Relay from 'react-relay';
import { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';

import { handleMutationError } from 'utils/network-layer';
import BucketForm from 'components/bucket-form';
import App from 'components/app';

import { CreateBucketMutation } from 'mutations/buckets';

import styles from 'sass/views/create-bucket.scss';


class CreateBucket extends Component {
  static contextTypes = {
    router: PropTypes.object,
    type: PropTypes.oneOf(['bill', 'expense', 'account']),
  };

  constructor() {
    super();
    this.state = { loading: false };
  }

  handleSubmit({ filters, name, type }) {
    const { viewer } = this.props;

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new CreateBucketMutation({ viewer, name, filters, type }), {
      onFailure: (response)=> {
        this.setState({ loading: false });
        handleMutationError(response);
      },
      onSuccess: ()=> {
        console.log('Success: CreateBucketMutation');
        this.setState({ loading: false });

        browserHistory.push('/app/dashboard');
      },
    });
  }

  render() {
    const { viewer, type } = this.props;
    const { loading } = this.state;

    return (
      <App viewer={viewer} back={true}>
        <div className={`container ${styles.root}`}>
          <div className='heading'>
            <h1>New Label</h1>
          </div>

          <BucketForm
            onSubmit={::this.handleSubmit}
            onCancel={()=> browserHistory.goBack()}
            viewer={viewer}
            bucket={null}
            loading={loading}
            initialType={type}
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
