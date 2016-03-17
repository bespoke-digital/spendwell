
import { Component } from 'react';
import Relay from 'react-relay';

import ConnectAccount from 'components/connect-account';
import Onboarding from 'components/onboarding';

import styles from 'sass/views/add-plaid.scss';


class AddAccountView extends Component {
  render() {
    const { viewer } = this.props;

    return (
      <Onboarding viewer={viewer}>
        <div className={`container ${styles.root}`}>
          <h1>Connect Accounts</h1>

          <ConnectAccount viewer={viewer}/>
        </div>
      </Onboarding>
    );
  }
}


AddAccountView = Relay.createContainer(AddAccountView, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${Onboarding.getFragment('viewer')}
        ${ConnectAccount.getFragment('viewer')}
      }
    `,
  },
});

export default AddAccountView;
