
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Button from 'components/button';
import Card from 'components/card';
import CardList from 'components/card-list';
import TextInput from 'components/text-input';


class GoalForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    loading: PropTypes.bool,
  };

  constructor() {
    super();
    this.state = { valid: false };
  }

  componentWillMount() {
    if (this.props.goal) {
      const { name, monthlyAmount } = this.props.goal;
      this.setState({ name, monthlyAmount });
    }
  }

  handleSubmit() {
    const { onSubmit } = this.props;
    const { name, monthlyAmount } = this.state;

    onSubmit({ name, monthlyAmount });
  }

  handleMonthlyAmountChange(monthlyAmount) {
    monthlyAmount = -parseInt(monthlyAmount * 100);
    if (!_.isNaN(monthlyAmount))
      this.setState({ monthlyAmount });
  }

  render() {
    const { onCancel, loading } = this.props;
    const { name, monthlyAmount } = this.state;

    return (
      <CardList>
        <Card>
          <TextInput
            label='Name'
            value={name}
            onChange={(name)=> this.setState({ name })}
            autoFocus={true}
          />
        </Card>
        <Card>
          <TextInput
            label='Monthly Amount'
            value={_.isNumber(monthlyAmount) && monthlyAmount !== 0 ?
              (Math.abs(monthlyAmount) / 100).toString()
            : ''}
            onChange={::this.handleMonthlyAmountChange}
          />
        </Card>
        <Card>
          <Button
            onClick={::this.handleSubmit}
            loading={loading}
            variant='primary'
          >Save</Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Card>
      </CardList>
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
