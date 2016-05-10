
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import CardList from 'components/card-list';
import TextInput from 'components/text-input';

import style from 'sass/components/goal-form';


class GoalForm extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
  };

  state = { valid: false };

  componentWillMount() {
    if (this.props.goal) {
      const { name, monthlyAmount } = this.props.goal;
      this.setState({ name, monthlyAmount });
    }
  }

  sendChange() {
    const { onChange } = this.props;
    const { name, monthlyAmount } = this.state;

    console.log('sendChange', { name, monthlyAmount });
    onChange({ name, monthlyAmount });
  }

  handleMonthlyAmountChange(monthlyAmount) {
    monthlyAmount = -parseInt(monthlyAmount * 100);
    if (!_.isNaN(monthlyAmount))
      this.setState({ monthlyAmount }, ::this.sendChange);
  }

  handleNameChange(name) {
    this.setState({ name }, ::this.sendChange);
  }

  render() {
    const { name, monthlyAmount } = this.state;

    return (
      <CardList className={style.root}>
        <Card>
          <TextInput
            label='Name'
            value={name}
            onChange={::this.handleNameChange}
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
