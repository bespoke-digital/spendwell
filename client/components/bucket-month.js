
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import moment from 'moment';
import Relay from 'react-relay';

import Card from 'components/card';
import Money from 'components/money';
import Progress from 'components/progress';


class BucketMonth extends Component {
  static propTypes = {
    month: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    selected: PropTypes.bool,
  };

  static defaultProps = {
    selected: false,
  };

  render() {
    const { bucketMonth, month, onClick, selected, children } = this.props;

    const currentAmount = 0;
    const previousAmount = 0;

    const progress = parseInt((currentAmount / previousAmount) * 100);
    const monthProgress = month.isBefore(moment().subtract(1, 'month')) ? 100 : (
      parseInt((moment().date() / month.clone().endOf('month').date()) * 100)
    );

    return (
      <Card onClick={onClick} expanded={selected} className={` bucket ${
        progress > 100 ? 'bucket-danger' :
        progress > monthProgress ? 'bucket-warn' :
        'bucket-success'
      }`}>
        <div className='summary'>
          <div>{bucketMonth.name}</div>
          <div className='amount avg'><Money amount={previousAmount} abs={true}/></div>
          <div className='amount'><Money amount={currentAmount} abs={true}/></div>
        </div>
        {selected ?
          <div>
            <Progress
              current={currentAmount}
              target={previousAmount}
              marker={monthProgress}
              color={progress > 100 ? 'danger' : progress > monthProgress ? 'warn' : 'success'}
            />
            <div className='progress-numbers'>
              <div><Money amount={currentAmount} abs={true}/></div>
              <div><Money amount={previousAmount} abs={true}/></div>
            </div>
            {bucketMonth.transactions.edges.length ?
              <table className='mui-table'>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bucketMonth.transactions.edges.map(({ node })=> (
                    <tr key={node.id}>
                      <td>{moment(node.date).format('Do')}</td>
                      <td>{node.description}</td>
                      <td><Money amount={node.amount} abs={true}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            : null}
            <div className='bucket-children'>{children}</div>
          </div>
        : null}
      </Card>
    );
  }
}

BucketMonth = Relay.createContainer(BucketMonth, {
  fragments: {
    bucketMonth: ()=> Relay.QL`
      fragment on BucketMonthNode {
        name
        transactions(first: 1000) {
          edges {
            node {
              id
              description
              amount
            }
          }
        }
      }
    `,
  },
});

export default BucketMonth;
