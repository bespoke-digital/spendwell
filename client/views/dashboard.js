
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import moment from 'moment';
import { Link } from 'react-router';

import Card from 'components/card';
import CardList from 'components/card-list';
import Button from 'components/button';
import Money from 'components/money';
import GoalMonth from 'components/goal-month';
import BucketMonth from 'components/bucket-month';
import BillMonth from 'components/bill-month';
import SpentFromSavings from 'components/spent-from-savings';
import TransactionList from 'components/transaction-list';
import ScrollTrigger from 'components/scroll-trigger';
import App from 'components/app';
import DashboardSummary from 'components/dashboard-summary';
import Transition from 'components/transition';
import GraphicCard from 'components/graphic-card';

import { AssignTransactionsMutation } from 'mutations/buckets';
import { SettingsMutation } from 'mutations/users';

import labelsImage from 'img/views/dashboard/labels.svg';

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

  syncBuckets(month) {
    const { viewer } = this.props;
    Relay.Store.commitUpdate(new AssignTransactionsMutation({ viewer, month }), {
      onSuccess: ()=> console.log('AssignTransactionsMutation Success'),
      onFailure: ()=> console.log('AssignTransactionsMutation Failure'),
    });
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

  hideHelp(show) {
    const { viewer } = this.props;

    Relay.Store.commitUpdate(new SettingsMutation({ viewer, dashboardHelp: !!show }), {
      onSuccess: ()=> console.log('SettingsMutation Success'),
      onFailure: ()=> console.log('SettingsMutation Failure'),
    });
  }

  render() {
    const { params: { year, month }, viewer } = this.props;
    const {
      spentFromSavings,
      allTransactions,
    } = viewer.summary;

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
      viewer.summary.billMonths.edges.map((e)=> e.node),
      (n)=> n.name.toLowerCase()
    );
    const bucketMonths = _.sortBy(
      viewer.summary.bucketMonths.edges.map((e)=> e.node),
      (n)=> n.name.toLowerCase()
    );

    const goalTargetTotal = _.sum(goalMonths, 'targetAmount');
    const goalFilledTotal = _.sum(goalMonths, 'filledAmount');

    const billAvgTotal = _.sum(billMonths, 'avgAmount');
    const billTotal = _.sum(billMonths, 'amount');

    const bucketAvgTotal = _.sum(bucketMonths, 'avgAmount');
    const bucketTotal = _.sum(bucketMonths, 'amount');

    return (
      <App viewer={viewer}>
        <ScrollTrigger
          className={`container ${styles.root}`}
          onTrigger={::this.loadTransactions}
        >
          <DashboardSummary
            viewer={viewer}
            summary={viewer.summary}
            periods={periods}
          />

          <Transition show={viewer.settings.dashboardHelp}>
            <CardList>
              <GraphicCard
                scheme='green'
                image={labelsImage}
                header='Get Started With Labels'
                dismiss={::this.hideHelp}
                paragraphs={
                  <span>
                    <p>
                      Labels are how you organize your spending with Spendwell.
                      Use them to track goals, bills, or other expenses
                      in the way that makes sense for you.
                    </p>
                    <p>
                      Popular labels:
                      {' '}<Link to='/app/labels/new'>Netflix</Link>,
                      {' '}<Link to='/app/labels/new'>Lunches</Link>,
                      {' '}<Link to='/app/labels/new'>Bank Fees</Link>,
                      {' '}<Link to='/app/labels/new'>Retirement Savings</Link>,
                      {' '}<Link to='/app/labels/new'>Car Fund</Link>.
                    </p>
                  </span>
                }
              />
            </CardList>
          </Transition>

          <div className='heading'>
            <h2>Goals <small> for long and short term savings</small></h2>

            <div>
              <Button to='/app/goals/new' flat={true} variant='primary'>New Goal</Button>
            </div>
          </div>


          {goalMonths.length > 0 ?
            <CardList className='month-list'>
              <Card className='card-list-heading'>
                <div></div>
                <div className='amount avg'>Target</div>
                <div className='amount'>Funded</div>
              </Card>

              {goalMonths.map((node)=>
                <GoalMonth
                  key={node.id}
                  goalMonth={node}
                  selected={selected === node.id}
                  onClick={this.select.bind(this, node.id)}
                />
              )}

              <Card summary={
                <div>
                  <div><strong>Total</strong></div>
                  <div className='amount avg'>
                    <Money amount={goalTargetTotal} abs={true}/>
                  </div>
                  <div className='amount'>
                    <Money amount={goalFilledTotal} abs={true}/>
                  </div>
                </div>
              }/>
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

          <div className='heading'>
            <h2>Bills <small> for monthly recurring expenses</small></h2>
            <div>
              <Button to='/app/labels/new/bill' flat={true} variant='primary'>
                {' New Label'}
              </Button>
            </div>
          </div>

          {billMonths.length > 0 ?
            <CardList className='month-list'>
              <Card className='card-list-heading'>
                <div></div>
                <div className='amount avg'>Average</div>
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
                />
              )}
              <Card summary={
                <div>
                  <div><strong>Total</strong></div>
                  <div className='amount avg'>
                    <Money amount={billAvgTotal} abs={true}/>
                  </div>
                  <div className='amount'>
                    <Money amount={billTotal} abs={true}/>
                  </div>
                </div>
              }/>
            </CardList>
          : null}

          <div className='heading'>
            <h2>Other Expenses <small> for non-recurring expenses</small></h2>
            <div>
              <Button to='/app/labels/new/expense' flat={true} variant='primary'>
                {' New Label'}
              </Button>
            </div>
          </div>

          {bucketMonths.length > 0 ?
            <CardList className='month-list'>
              <Card className='card-list-heading'>
                <div></div>
                <div className='amount avg'>Average</div>
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
                />
              )}
              <Card summary={
                <div>
                  <div><strong>Total</strong></div>
                  <div className='amount avg'>
                    <Money amount={bucketAvgTotal} abs={true}/>
                  </div>
                  <div className='amount'>
                    <Money amount={bucketTotal} abs={true}/>
                  </div>
                </div>
              }/>
            </CardList>
          : null}

          <div className='heading'>
            <h2>All Transactions</h2>
          </div>

          <CardList>
            <TransactionList
              viewer={viewer}
              transactions={allTransactions}
              abs={true}
            />

            {allTransactions && allTransactions.pageInfo.hasNextPage ?
              <div className='bottom-buttons'>
                <Button onClick={::this.loadTransactions} raised>Load More</Button>
              </div>
            : null}
          </CardList>
        </ScrollTrigger>
      </App>
    );
  }
}

const now = moment();

Dashboard = Relay.createContainer(Dashboard, {
  initialVariables: {
    month: now.format('MM'),
    year: now.format('YYYY'),
    transactionCount: 20,
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

        settings {
          dashboardHelp
        }

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
                id
                name
                avgAmount
                amount
              }
            }
          }
          billMonths(first: 1000) {
            edges {
              node {
                ${BillMonth.getFragment('bucketMonth')}
                id
                name
                avgAmount
                amount
              }
            }
          }
          incomeTransactions: transactions(first: 100, amountGt: 0) {
            ${TransactionList.getFragment('transactions')}
          }
          allTransactions: transactions(first: $transactionCount, amountLt: 0) {
            ${TransactionList.getFragment('transactions')}
            pageInfo {
              hasNextPage
            }
          }
        }
      }
    `,
  },
});

export default Dashboard;
