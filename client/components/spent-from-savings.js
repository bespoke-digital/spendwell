
import { Component, PropTypes } from 'react';
import moment from 'moment';
import Relay from 'react-relay';

import Card from 'components/card';
import Money from 'components/money';


class SpentFromSavings extends Component {
  static propTypes = {
    month: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    selected: PropTypes.bool,
  };

  static defaultProps = {
    selected: false,
  };

  render() {
    const { summary, onClick, selected } = this.props;

    return (
      <Card onClick={onClick} expanded={selected}>
        <div className='summary'>
          <div>Spent From Savings</div>
          <div className='amount'>
            <Money amount={summary.spentFromSavings} abs={true}/>
          </div>
        </div>
        {summary.transactions.edges.length ?
          <table className='mui-table'>
            <thead>
              <tr>
                <th>Day</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {summary.transactions.edges.map(({ node })=> (
                <tr key={node.id}>
                  <td>{moment(node.date).format('Do')}</td>
                  <td>{node.description}</td>
                  <td><Money amount={node.amount} abs={true}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        : null}
      </Card>
    );
  }
}

SpentFromSavings = Relay.createContainer(SpentFromSavings, {
  fragments: {
    summary: ()=> Relay.QL`
      fragment on Summary {
        spentFromSavings
        transactions(first: 1000, fromSavings: true) {
          edges {
            node {
              id
              description
              amount
              date
            }
          }
        }
      }
    `,
  },
});

export default SpentFromSavings;
