
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Button from 'components/button';
import Card from 'components/card';
import TextInput from 'components/text-input';


class GoalForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = { valid: false };
  }

  componentWillMount() {
    if (this.props.goal) {
      const { name, monthlyAmount } = this.props.goal;
      this.setState({
        name,
        monthlyAmount: monthlyAmount / 100,
      });
    }
  }

  handleSubmit() {
    const { onSubmit } = this.props;
    const { name, monthlyAmount } = this.state;

    onSubmit({ name, monthlyAmount });
  }

  render() {
    const { onCancel } = this.props;
    const { name, monthlyAmount } = this.state;

    return (
      <Card>
        <TextInput
          label='Name'
          value={name}
          onChange={(name)=> this.setState({ name })}
        />
        <TextInput
          label='Monthly Amount'
          value={monthlyAmount}
          onChange={(monthlyAmount)=> this.setState({ monthlyAmount })}
        />

        <Button onClick={::this.handleSubmit} variant='primary'>Save</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Card>
    );
  }
}

GoalForm = Relay.createContainer(GoalForm, {
  fragments: {
    goal: ()=> Relay.QL`
      fragment on GoalNode {
        name
        monthlyAmount
      }
    `,
  },
});

export default GoalForm;
