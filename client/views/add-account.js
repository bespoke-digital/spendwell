
import { Component } from 'react';
import Relay from 'react-relay';

import ConnectAccount from 'components/connect-account';
import App from 'components/app';


class AddAccountView extends Component {
  render() {
    const { viewer } = this.props;

    return (
      <App
        viewer={viewer}
        className='container skinny'
        title='Connect Accounts'
      >
        <ConnectAccount viewer={viewer}/>
      </App>
    );
  }
}


AddAccountView = Relay.createContainer(AddAccountView, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        ${ConnectAccount.getFragment('viewer')}
      }
    `,
  },
});

export default AddAccountView;
