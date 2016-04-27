
import Relay from 'react-relay';
import { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';

import { handleMutationError } from 'utils/network-layer';
import BucketForm from 'components/bucket-form';
import App from 'components/app';
import PageHeading from 'components/page-heading';

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

  handleSubmit({ filters, name }) {
    const { viewer, type } = this.props;

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
          <PageHeading>
            <h1>{type === 'expense' ? 'Create a Label' : 'Create a Bill'}</h1>
            <p>{type === 'expense' ? `
              Labels are for tracking spending. We'll show you your average spend
              and if you're on track to be over or under.
            ` : `
              Bills are for monthly recurring expenses. We'll track if the bill has been
              paid and take unpaid bills out of safe-to-spend.
            `}</p>
          </PageHeading>

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
