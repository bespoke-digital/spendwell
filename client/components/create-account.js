
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import relayContainer from 'relay-decorator';

import TextInput from 'components/text-input';
import Button from 'components/button';
import Modal from 'components/modal';

import { CreateAccountMutation } from 'mutations/accounts';


@relayContainer({
  fragments: {
    institution: ()=> Relay.QL`
      fragment on InstitutionNode {
        ${CreateAccountMutation.getFragment('institution')}
      }
    `,
  },
})
export default class CreateAccount extends Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = {};
  }

  handleCreate() {
    const { institution, onClose } = this.props;
    const { name } = this.state;

    if (!name) return;

    Relay.Store.commitUpdate(new CreateAccountMutation({ institution, name }), {
      onSuccess: onClose,
      onFailure: console.log.bind(console, 'onFailure'),
    });
  }

  render() {
    const { onClose, open } = this.props;
    return (
      <Modal onClose={onClose} open={open}>
        <h3>Create Account</h3>
        <TextInput
          label='Institution Name'
          onChange={(name)=> this.setState({ name })}
        />
        <Button variant='primary' onClick={::this.handleCreate}>Create</Button>
      </Modal>
    );
  }
}
