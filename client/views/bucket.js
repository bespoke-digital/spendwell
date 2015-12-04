
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form } from 'formsy-react';

import { getBucket, updateBucket } from 'state/buckets';
import { listTransactions } from 'state/transactions';
import { listCategories } from 'state/categories';
import Card from 'components/card';
import Button from 'components/button';
import TransactionList from 'components/transaction-list';
import Input from 'components/forms/input';
import Checkbox from 'components/forms/checkbox';
import CategorySelector from 'components/forms/category-selector';

import styles from 'sass/views/bucket.scss';


class Bucket extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    bucket: PropTypes.object,
  };

  constructor() {
    super();
    this.state = { showSettings: false };
  }

  componentDidMount() {
    this.props.dispatch(getBucket({ id: this.props.params.id }));

    this.updateTransactions();

    if (this.props.categories.length === 0)
      this.props.dispatch(listCategories());
  }

  updateTransactions(data = {}) {
    data.inflow = false;
    this.props.dispatch(listTransactions(_.omit(data, (o)=> _.isUndefined(o) || o === '')));
  }

  handleSubmit(data) {
    data.id = this.props.bucket.id;
    this.props.dispatch(updateBucket(data));
    this.setState({ showSettings: false });
  }

  handleFilterUpdate(data) {
    this.updateTransactions(data);
  }

  handleCategoryChange(categoryId) {
    if (!categoryId) {
      this.setState({ category: null });

    } else {
      const category = _.find(this.props.categories, { id: categoryId });
      this.setState({ category });
    }
  }

  render() {
    const { bucket, transactions, categories } = this.props;
    const { showSettings, category } = this.state;

    if (!bucket) return <div></div>;

    return (
      <div className={`container ${styles.root}`}>
        <h1>
          {`${bucket.name} `}
          <a href='#' onClick={this.setState.bind(this, { showSettings: !showSettings }, null)}>
            <i className='fa fa-cog'/>
          </a>
        </h1>

        <Card className={showSettings ? '' : 'gone'} expanded={true}>
          <Form onValidSubmit={::this.handleSubmit}>
            <Input label='Name' name='name' value={bucket.name} required/>
            <Input
              label='Monthly Amount'
              name='monthly_amount'
              value={bucket.monthly_amount}
              validators='isNumeric'
              required
            />
            <Checkbox
              label='Autofill'
              name='autofill'
              value={bucket.autofill}
              required
            />
            <Button type='submit' variant='primary'>Save</Button>
            <Button onClick={this.setState.bind(this, { showSettings: false }, null)}>Cancel</Button>
          </Form>
        </Card>

        <Card>
          <h2>Transactions</h2>
          <Form onChange={_.debounce(::this.handleFilterUpdate)}>
            <Input name='name' label='Name'/>
            <Input name='time_gte' label='After Time'/>
            <Input name='time_lte' label='Before Time'/>
            <CategorySelector name='category' categories={categories}/>
          </Form>
        </Card>

        <TransactionList transactions={transactions}/>
      </div>
    );
  }
}

export default connect((state)=> ({
  bucket: state.buckets.get.bucket,
  transactions: state.transactions.list,
  categories: state.categories,
}))(Bucket);
