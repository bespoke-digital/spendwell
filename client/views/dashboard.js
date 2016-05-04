
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import moment from 'moment';
import { browserHistory } from 'react-router';

import Card from 'components/card';
import CardList from 'components/card-list';
import Money from 'components/money';
import GoalMonth from 'components/goal-month';
import BucketMonth from 'components/bucket-month';
import BillMonth from 'components/bill-month';
import SpentFromSavings from 'components/spent-from-savings';
import TransactionList from 'components/transaction-list';
import App from 'components/app';
import DashboardSummary from 'components/dashboard-summary';
import ListHeading from 'components/list-heading';
import PrimaryFab from 'components/primary-fab';
import Icon from 'components/icon';

import { AssignTransactionsMutation } from 'mutations/buckets';
import { SettingsMutation } from 'mutations/users';

import styles from 'sass/views/dashboard.scss';


class Dashboard extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {
      selected: null,
    };
  }

  select(id) {
    const { selected } = this.state;

    if (selected === id)
      this.setState({ selected: null });
    else
      this.setState({ selected: id });
  }

  loadTransactions() {
    const { relay } = this.props;
    const { transactionCount } = relay.variables;

    relay.setVariables({ transactionCount: transactionCount + 20 });
  }

  render() {
    const { params: { year, month }, viewer } = this.props;
    const { spentFromSavings } = viewer.summary;

    const { selected } = this.state;

    const now = moment().startOf('month');
    const current = year && month ? moment(`${year}-${month}-0`) : now;
    const first = moment(viewer.firstMonth, 'YYYY/MM');
    const periods = {
      first,
      now,
      current,
      previous: current.clone().subtract(1, 'month'),
      next: current.clone().add(1, 'month'),
    };

    const goalMonths = _.sortBy(
      viewer.summary.goalMonths.edges.map((e)=> e.node),
      (n)=> n.name.toLowerCase()
    );
    const billMonths = _.sortBy(
      viewer.summary.bucketMonths.edges
        .map(({ node })=> node)
        .filter(({ bucket })=> bucket.type === 'bill'),
      (bm)=> bm.bucket.name.toLowerCase()
    );
    const bucketMonths = _.sortBy(
      viewer.summary.bucketMonths.edges
        .map(({ node })=> node)
        .filter(({ bucket })=> bucket.type === 'expense'),
      (bm)=> bm.bucket.name.toLowerCase()
    );

    const goalTargetTotal = _.sum(goalMonths, 'targetAmount');
    const goalFilledTotal = _.sum(goalMonths, 'filledAmount');

    const billAvgTotal = _.sum(billMonths, 'avgAmount');
    const billTotal = _.sum(billMonths, 'amount');

    const bucketAvgTotal = _.sum(bucketMonths, 'avgAmount');
    const bucketTotal = _.sum(bucketMonths, 'amount');

    return (
      <App viewer={viewer} title='Dashboard'>
        <div className={`container ${styles.root}`}>
          <DashboardSummary
            viewer={viewer}
            summary={viewer.summary}
            periods={periods}
          />

          {goalMonths.length > 0 ?
            <CardList className='month-list'>
              <ListHeading>
                Goals <small> for long and short term savings</small>
              </ListHeading>

              <Card className='card-list-heading'>
                <div></div>
                <div className='amount'>Target</div>
                <div className='amount'>Funded</div>
              </Card>

              {goalMonths.map((node)=>
                <GoalMonth
                  key={node.id}
                  goalMonth={node}
                  selected={selected === node.id}
                  onClick={this.select.bind(this, node.id)}
                  className='month'
                />
              )}

              <Card className='card-list-heading'>
                <div><strong>Total</strong></div>
                <div className='amount avg'>
                  <Money amount={goalTargetTotal} abs={true}/>
                </div>
                <div className='amount'>
                  <Money amount={goalFilledTotal} abs={true}/>
                </div>
              </Card>
            </CardList>
          : null}

          {spentFromSavings > 0 ?
            <CardList>
              <SpentFromSavings
                viewer={viewer}
                summary={viewer.summary}
                month={periods.current}
                selected={selected === 'spentFromSavings'}
                onClick={this.select.bind(this, 'spentFromSavings')}
              />
            </CardList>
          : null}

          {billMonths.length > 0 ?
            <CardList className='month-list'>
              <ListHeading>
                Bills <small> for monthly recurring expenses</small>
              </ListHeading>

              <Card className='card-list-heading'>
                <div></div>
                <div className='amount'>Average</div>
                <div className='amount'>Spent</div>
              </Card>

              {billMonths.map((node)=>
                <BillMonth
                  key={node.id}
                  viewer={viewer}
                  bucketMonth={node}
                  month={periods.current}
                  expanded={selected === node.id}
                  onClick={this.select.bind(this, node.id)}
                  className='month'
                />
              )}

              <Card className='card-list-heading'>
                <div><strong>Total</strong></div>
                <div className='amount avg'>
                  <Money amount={billAvgTotal} abs={true}/>
                </div>
                <div className='amount'>
                  <Money amount={billTotal} abs={true}/>
                </div>
              </Card>
            </CardList>
          : null}

          {bucketMonths.length > 0 ?
            <CardList className='month-list'>
              <ListHeading>
                Labels <small> for tracking spending</small>
              </ListHeading>

              <Card className='card-list-heading'>
                <div></div>
                <div className='amount'>Average</div>
                <div className='amount'>Spent</div>
              </Card>

              {bucketMonths.map((node)=>
                <BucketMonth
                  key={node.id}
                  viewer={viewer}
                  bucketMonth={node}
                  month={periods.current}
                  expanded={selected === node.id}
                  onClick={this.select.bind(this, node.id)}
                  className='month'
                />
              )}

              <Card className='card-list-heading'>
                <div><strong>Total</strong></div>
                <div className='amount avg'>
                  <Money amount={bucketAvgTotal} abs={true}/>
                </div>
                <div className='amount'>
                  <Money amount={bucketTotal} abs={true}/>
                </div>
              </Card>
            </CardList>
          : null}

          <PrimaryFab actions={[
            {
              label: 'New Goal',
              className: 'goal-fab',
              icon: <Icon type='show chart' color='light'/>,
              onClick: ()=> browserHistory.push('/app/goals/new'),
            },
            {
              label: 'New Bill',
              className: 'bill-fab',
              icon: <Icon type='receipt' color='light'/>,
              onClick: ()=> browserHistory.push('/app/labels/new/bill'),
            },
            {
              default: true,
              label: 'New Label',
              className: 'label-fab',
              icon: <Icon type='local offer' color='light'/>,
              onClick: ()=> browserHistory.push('/app/labels/new/expense'),
            },
          ]}/>
        </div>
      </App>
    );
  }
}

const now = moment();

Dashboard = Relay.createContainer(Dashboard, {
  initialVariables: {
    month: now.format('MM'),
    year: now.format('YYYY'),
  },
  prepareVariables: (variables)=> {
    if (variables.year && variables.month)
      return { ...variables, date: `${variables.year}/${variables.month}` };
    else
      return variables;
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        ${AssignTransactionsMutation.getFragment('viewer')}
        ${DashboardSummary.getFragment('viewer')}
        ${TransactionList.getFragment('viewer')}
        ${SpentFromSavings.getFragment('viewer')}
        ${BucketMonth.getFragment('viewer')}
        ${BillMonth.getFragment('viewer')}
        ${SettingsMutation.getFragment('viewer')}

        firstMonth

        summary(month: $date) {
          ${SpentFromSavings.getFragment('summary')}
          ${DashboardSummary.getFragment('summary')}

          spentFromSavings

          goalMonths(first: 1000) {
            edges {
              node {
                ${GoalMonth.getFragment('goalMonth')}
                id
                name
                targetAmount
                filledAmount
              }
            }
          }

          bucketMonths(first: 1000) {
            edges {
              node {
                ${BucketMonth.getFragment('bucketMonth')}
                ${BillMonth.getFragment('bucketMonth')}

                id
                avgAmount
                amount

                bucket {
                  id
                  name
                  type
                }
              }
            }
          }

          incomeTransactions: transactions(first: 100, amountGt: 0) {
            ${TransactionList.getFragment('transactions')}
          }
        }
      }
    `,
  },
});

export default Dashboard;
