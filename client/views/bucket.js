
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form } from 'formsy-react';

import { getBucket, updateBucket } from 'state/buckets';
import { listTransactions } from 'state/transactions';
import { listCategories } from 'state/categories';
import Card from 'components/card';
import CardList from 'components/card-list';
import Button from 'components/button';
import Input from 'components/forms/input';
import Checkbox from 'components/forms/checkbox';
import Select from 'components/forms/select';
import TimePicker from 'components/forms/time-picker';
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

    if (this.props.categories.length === 0)
      this.props.dispatch(listCategories());
  }

  handleSubmit(data) {
    data.id = this.props.bucket.id;
    this.props.dispatch(updateBucket(data));
    this.setState({ showSettings: false });
  }

  handleFilterUpdate(data) {
    console.log(data);
    this.props.dispatch(listTransactions(_.omit(data, (o)=> !o)));
  }

  render() {
    const { bucket, transactions, categories } = this.props;
    const { showSettings } = this.state;

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
            <Button type='submit' varient='primary'>Save</Button>
            <Button onClick={this.setState.bind(this, { showSettings: false }, null)}>Cancel</Button>
          </Form>
        </Card>

        <Card>
          <h2>Transactions</h2>
          <Form onChange={_.debounce(::this.handleFilterUpdate)}>
            <Input label='Name' name='name'/>
            <Select
              label='Category'
              name='category'
              varient='primary'
              options={[
                { value: null, label: 'All' },
              ].concat(categories.map((category)=> ({
                value: category.id,
                label: category.name,
              })))}
            />
            <TimePicker
              floatingLabelText='After Time'
              name='time_gte'
            />
            <TimePicker
              floatingLabelText='Before Time'
              name='time_lte'
            />
          </Form>
        </Card>

        <CardList>
          {transactions.map((transaction)=> (
            <Card ket={transaction.id}>
              {`${transaction.name}: ${transaction.amount}`}
            </Card>
          ))}
        </CardList>
      </div>
    );
  }
}

export default connect((state)=> ({
  bucket: state.buckets.get.bucket,
  transactions: state.transactions.list,
  categories: state.categories,
}))(Bucket);
