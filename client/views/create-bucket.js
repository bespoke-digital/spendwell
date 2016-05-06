
import Relay from 'react-relay';
import { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';

import { handleMutationError } from 'utils/network-layer';
import BucketForm from 'components/bucket-form';
import App from 'components/app';
import Card from 'components/card';
import CardList from 'components/card-list';
import TextActions from 'components/text-actions';
import A from 'components/a';

import { CreateBucketMutation } from 'mutations/buckets';
import { SettingsMutation } from 'mutations/users';

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

  dismissHelp() {
    const { viewer, type } = this.props;

    Relay.Store.commitUpdate(new SettingsMutation({
      viewer,
      [type === 'expense' ? 'createLabelHelp' : 'createBillHelp']: false,
    }), { onFailure: handleMutationError });
  }

  render() {
    const { viewer, type } = this.props;
    const { loading } = this.state;

    return (
      <App
        viewer={viewer}
        back={true}
        title={type === 'expense' ? 'New Label' : 'New Bill'}
        className={styles.root}
      >
        {(type === 'expense' && viewer.settings.createLabelHelp) || (type === 'bill' && viewer.settings.createBillHelp) ?
          <CardList>
            <Card>
              {type === 'expense' ? `
                Labels are for tracking spending. We'll show you your average spend
                and if you're on track to be over or under.
              ` : `
                Bills are for monthly recurring expenses. We'll track if the bill has been
                paid and take unpaid bills out of safe-to-spend.
              `}
              <TextActions>
                <A onClick={::this.dismissHelp}>Dismiss</A>
              </TextActions>
            </Card>
          </CardList>
        : null}

        <BucketForm
          onSubmit={::this.handleSubmit}
          onCancel={()=> browserHistory.goBack()}
          viewer={viewer}
          bucket={null}
          loading={loading}
        />
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
        ${BucketForm.getFragment('viewer')}
        ${CreateBucketMutation.getFragment('viewer')}
        ${SettingsMutation.getFragment('viewer')}

        settings {
          createLabelHelp
          createBillHelp
        }
      }
    `,
  },
});

export default CreateBucket;
