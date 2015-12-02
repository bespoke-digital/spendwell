
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form } from 'formsy-react';

import { getBucket, updateBucket } from 'state/buckets';
import { listTransactions } from 'state/transactions';
import Card from 'components/card';
import CardList from 'components/card-list';
import Button from 'components/button';
import Input from 'components/forms/input';
import styles from 'sass/views/bucket.scss';


class Bucket extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    bucket: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = { showSettings: false };
  }

  componentDidMount() {
    this.props.dispatch(getBucket({ id: this.props.params.id }));
  }

  handleSubmit(data) {
    data.id = this.props.bucket.id;
    this.props.dispatch(updateBucket(data));
    this.setState({ showSettings: false });
  }

  handleFilterUpdate(data) {
    this.props.dispatch(listTransactions(data));
  }

  render() {
    const { bucket, transactions } = this.props;
    const { showSettings } = this.state;

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
            {/* <FormsyCheckbox
              floatingLabelText='Autofill'
              name='autofill'
              value={bucket.autofill}
              required
            /> */}
            <Button type='submit' varient='primary'>Save</Button>
            <Button onClick={this.setState.bind(this, { showSettings: false }, null)}>Cancel</Button>
          </Form>
        </Card>

        <Card>
          <h2>Transactions</h2>
          <Form onChange={_.debounce(::this.handleFilterUpdate)}>
            <Input label='Name' name='name__icontains'/>
          </Form>
        </Card>

        <CardList>
          {transactions.map((transaction)=> (
            <Card>{`${transaction.name}: ${transaction.amount}`}</Card>
          ))}
        </CardList>
      </div>
    );
  }
}

export default connect((state)=> ({
  bucket: state.buckets.get.bucket,
  transactions: state.transactions.list,
}))(Bucket);
