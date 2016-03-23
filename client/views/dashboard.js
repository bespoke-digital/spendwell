
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
import Icon from 'components/icon';
import Transition from 'components/transition';

import { AssignTransactionsMutation } from 'mutations/buckets';

import styles from 'sass/views/dashboard.scss';
import goalsImage from 'img/views/dashboard/goals.svg';
import billsImage from 'img/views/dashboard/bills.svg';
import spendingImage from 'img/views/dashboard/spending.svg';


class Dashboard extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {
      selected: null,
      goalsHelp: localStorage.getItem('help.dashboard.goals') !== 'hidden',
      billsHelp: localStorage.getItem('help.dashboard.bills') !== 'hidden',
      spendingHelp: localStorage.getItem('help.dashboard.spending') !== 'hidden',
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

  toggleHelp(type, event) {
    if (event) event.preventDefault();

    if (this.state[`${type}Help`]) {
      localStorage.setItem(`help.dashboard.${type}`, 'hidden');
      this.setState({ [`${type}Help`]: false });

    } else {
      localStorage.setItem(`help.dashboard.${type}`, 'visible');
      this.setState({ [`${type}Help`]: true });
    }
  }

  render() {
    if (!this.props.viewer.summary) {
      console.log('fuck this shit', this.props);
      return <div className='container'>No Summary</div>;
    }

    const { params: { year, month }, viewer } = this.props;
    const {
      spentFromSavings,
      allTransactions,
    } = viewer.summary;

    const { selected, goalsHelp, billsHelp, spendingHelp } = this.state;

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

          <div className='heading'>
            <h2>Goals <small>
              for long and short term savings
              <a
                href='#'
                onClick={this.toggleHelp.bind(this, 'goals')}
                className='help-icon'
              ><Icon type='question-circle'/></a>
            </small></h2>

            <div>
              <Button to='/app/goals/new' flat={true} variant='primary'>New Goal</Button>
            </div>
          </div>

          <Transition show={goalsHelp}>
            <Card className='help'>
              <Icon type='times' onClick={this.toggleHelp.bind(this, 'goals')}/>
              <img src={goalsImage}/>
              <h3>Pay Yourself First</h3>
              <p>
                This is where you organize your savings goals.
                We recommend that you save 10-15% of your gross income if
                possible. If not, don’t sweat it. Save what you can.
              </p>
              <p>
                Here are some
                popular goals to help get you started: <Link to=''>Vacation</Link>{', '}
                <Link to=''>Retirement Savings</Link>{', '} <Link to=''>Car Fund</Link> and <Link to=''>Debt Payout</Link>.
              </p>
              <div className='clearfix'/>
            </Card>
          </Transition>

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
                summary={viewer.summary}
                month={periods.current}
                selected={selected === 'spentFromSavings'}
                onClick={this.select.bind(this, 'spentFromSavings')}
              />
            </CardList>
          : null}

          <div className='heading'>
            <h2>Bills <small>
              for monthly recurring expenses
              <a
                href='#'
                onClick={this.toggleHelp.bind(this, 'bills')}
                className='help-icon'
              ><Icon type='question-circle'/></a>
            </small></h2>
            <div>
              <Button to='/app/labels/new/bill' flat={true} variant='primary'>
                {' New Label'}
              </Button>
            </div>
          </div>

          <Transition show={billsHelp}>
            <Card className='help'>
              <Icon type='times' onClick={this.toggleHelp.bind(this, 'bills')}/>
              <img src={billsImage}/>
              <h3>Live Within Your Means</h3>
              <p>
                Bills are a type of label for monthly recurring expenses. We make
                sure money is put asside to pay them off at the beginning of
                each month. This will make your Safe To Spend number safe, even
                from unpaid bills.
              </p>
              <p>
                Some examples are <Link to=''>Netflix</Link>,
                your <Link to=''>Cell Phone</Link> bill
                or <Link to=''>Life Insurance</Link>.
              </p>
              <div className='clearfix'/>
            </Card>
          </Transition>

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
            <h2>Labels <small>
              for non-recurring expenses
              <a
                href='#'
                onClick={this.toggleHelp.bind(this, 'spending')}
                className='help-icon'
              ><Icon type='question-circle'/></a>
            </small></h2>
            <div>
              <Button to='/app/labels/new/expense' flat={true} variant='primary'>
                {' New Label'}
              </Button>
            </div>
          </div>

          <Transition show={spendingHelp}>
            <Card className='help'>
              <Icon type='times' onClick={this.toggleHelp.bind(this, 'spending')}/>
              <img src={spendingImage}/>
              <h3>Understand Where Your Money Goes</h3>
              <p>
                Goals and Bills have your monthly set obligations covered and
                provide you with your Safe To Spend number. Spending money on
                things you need or want should be fun and this is where you’ll
                track those transactions. Here is where you can set up some clever
                labels like, [Lunches], [Groceries], [Kids], [Ubers] and anything
                else your heart desires.
              </p>
              <div className='clearfix'/>
            </Card>
          </Transition>

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
            <TransactionList transactions={allTransactions} abs={false}/>

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
          allTransactions: transactions(first: $transactionCount) {
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
