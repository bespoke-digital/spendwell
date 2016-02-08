
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import relayContainer from 'relay-decorator';

import TextInput from 'components/text-input';
import Button from 'components/button';
import Modal from 'components/modal';

import { AddInstitutionMutation } from 'mutations/institutions';


@relayContainer({
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${AddInstitutionMutation.getFragment('viewer')}
      }
    `,
  },
})
export default class CreateInstitution extends Component {
  static propTypes = {
    onClose: PropTypes.func,
  }

  constructor() {
    super();
    this.state = {};
  }

  handleCreate() {
    const { viewer } = this.props;
    const { name } = this.state;

    if (!name) return;

    Relay.Store.commitUpdate(new AddInstitutionMutation({ viewer, name }), {
      onSuccess: ()=> this.refs.modal.close(),
      onFailure: console.log.bind(console, 'onFailure'),
    });
  }

  render() {
    const { onClose } = this.props;
    return (
      <Modal onClose={onClose} ref='modal'>
        <h3>Create Institution</h3>
        <TextInput
          label='Institution Name'
          onChange={(name)=> this.setState({ name })}
        />
        <Button variant='primary' onClick={::this.handleCreate}>Create</Button>
      </Modal>
    );
  }
}
