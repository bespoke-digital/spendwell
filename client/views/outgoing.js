
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import { Form } from 'formsy-react';

import Card from 'components/card';
import Button from 'components/button';
import TransactionList from 'components/transaction-list';
import Input from 'components/forms/input';

import styles from 'sass/views/bucket.scss';


const OUTGOING_FILTER = {
  type: 'hidden',
  amount: { $lt: 0 },
  transfer: false,
};


export default class Outgoing extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = { showSave: false, filters: [OUTGOING_FILTER] };
  }

  createBucket({ name }) {
    const { filters } = this.state;
    const { history } = this.props;

    Meteor.call('bucketsCreate', {
      name,
      filters: _.without(filters, OUTGOING_FILTER),
      type: 'outgoing',
    }, (err, bucketId)=> {
      if (err) throw err;
      history.push({ pathname: `/buckets/${bucketId}` });
    });
  }

  render() {
    const { filters, showSave } = this.state;

    return (
      <div className={`container ${styles.root}`}>

        <div className='heading'>
          <Button to='/' className='back'>
            <i className='fa fa-long-arrow-left'/>
          </Button>

          <h1>Outgoing</h1>
        </div>

        {showSave ?
          <Card expanded={true}>
            <div className='summary'>
              <h3>Create Bucket</h3>
            </div>
            <Form onValidSubmit={::this.createBucket}>
              <Input name='name' label='Name' required/>
              <Button variant='primary' type='submit'>
                Create Bucket
              </Button>
            </Form>
          </Card>
        : null}

        <TransactionList
          filters={filters}
          onFiltersChange={(filters)=> this.setState({ filters })}
        >
          {filters.length > 1 && !showSave ?
            <Button
              variant='primary'
              onClick={()=> this.setState({ showSave: true })}
            >
              <i className='fa fa-save'/>
              {' Save As Bucket'}
            </Button>
          : null}
        </TransactionList>
      </div>
    );
  }
}
