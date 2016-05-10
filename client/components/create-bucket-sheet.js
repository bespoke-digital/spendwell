
import Relay from 'react-relay';
import { Component, PropTypes } from 'react';

import BucketForm from 'components/bucket-form';
import Card from 'components/card';
import CardList from 'components/card-list';
import TextActions from 'components/text-actions';
import A from 'components/a';
import BottomSheet from 'components/bottom-sheet';
import Icon from 'components/icon';
import Spinner from 'components/spinner';

import { handleMutationError } from 'utils/network-layer';
import { CreateBucketMutation } from 'mutations/buckets';
import { SettingsMutation } from 'mutations/users';

import styles from 'sass/components/create-bucket-sheet';


class CreateBucketSheet extends Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    type: PropTypes.oneOf(['bill', 'expense', 'account']),
  };

  state = {
    loading: false,
    filters: [],
    name: '',
  };

  isValid() {
    const { loading, filters, name } = this.state;
    return !loading && filters.length > 0 & name.length > 0;
  }

  handleSubmit() {
    const { viewer, type, onRequestClose, relay } = this.props;
    const { filters, name } = this.state;

    if (!this.isValid())
      return;

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new CreateBucketMutation({ viewer, name, filters, type }), {
      onFailure: (response)=> {
        this.setState({ loading: false });
        handleMutationError(response);
      },
      onSuccess: ()=> {
        console.log('Success: CreateBucketMutation');
        this.setState({ loading: false, filters: [], name: '' });
        relay.forceFetch();
        onRequestClose();
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
    const { viewer, type, visible, onRequestClose } = this.props;
    const { loading } = this.state;

    return (
      <BottomSheet
        className={`${styles.root} ${type}`}
        visible={visible}
        onRequestClose={onRequestClose}
        title={type === 'expense' ? 'New Label' : 'New Bill'}
        actions={loading ?
          <div className='spinner-container'><Spinner/></div>
        :
          <A className='action' onClick={::this.handleSubmit}>
            <Icon type='send' color={this.isValid() ? 'light' : 'dark'}/>
          </A>
        }
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
          onChange={({ filters, name })=> this.setState({ filters, name })}
          viewer={viewer}
          bucket={null}
          loading={loading}
        />
      </BottomSheet>
    );
  }
}

CreateBucketSheet = Relay.createContainer(CreateBucketSheet, {
  initialVariables: {
    filters: [],
    count: 50,
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
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

export default CreateBucketSheet;
