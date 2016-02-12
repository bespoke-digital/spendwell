
import Relay from 'react-relay';
import { Component } from 'react';
import { browserHistory } from 'react-router';

import Button from 'components/button';
import Card from 'components/card';
import TextInput from 'components/text-input';
import Filters from 'components/filters';
import TransactionList from 'components/transaction-list';

import { CreateBucketMutation } from 'mutations/buckets';

import styles from 'sass/views/create-bucket.scss';


class CreateGoal extends Component {
  constructor() {
    super();
    this.state = { filters: [{}], name: '' };
  }

  handleSubmit() {
    const { viewer } = this.props;
    const { filters, name } = this.state;

    Relay.Store.commitUpdate(new CreateBucketMutation({ viewer, name, filters }), {
      onSuccess: ()=> {
        console.log('CreateBucketMutation Success');
        browserHistory.goBack();
      },
      onFailure: ()=> console.log('CreateBucketMutation Failure'),
    });
  }

  handleFilterChange(filters) {
    this.props.relay.setVariables({ filters });
    this.setState({ filters });
  }

  render() {
    const { viewer: { transactions } } = this.props;
    const { name, filters } = this.state;

    const valid = name.length && filters.length;

    return (
      <div className={`container ${styles.root}`}>
        <div className='heading'>
          <Button onClick={()=> browserHistory.goBack()} className='back'>
            <i className='fa fa-long-arrow-left'/>
          </Button>

          <h1>New Bucket</h1>
        </div>

        <Card>
          <TextInput label='Name' value={name} onChange={(name)=> this.setState({ name })}/>
        </Card>

        <Card>
          <h3>Filters</h3>
        </Card>

        <Filters value={filters} onChange={::this.handleFilterChange}/>

        <Card>
          <Button
            variant='primary'
            disabled={!valid}
            onClick={::this.handleSubmit}
          >Create</Button>
          <Button onClick={()=> browserHistory.goBack()}>Cancel</Button>
        </Card>

        <TransactionList transactions={transactions}/>
      </div>
    );
  }
}

CreateGoal = Relay.createContainer(CreateGoal, {
  initialVariables: {
    filters: [],
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${CreateBucketMutation.getFragment('viewer')}
        transactions(first: 500, filters: $filters) {
          ${TransactionList.getFragment('transactions')}
        }
      }
    `,
  },
});

export default CreateGoal;
