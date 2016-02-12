
import { Component, PropTypes } from 'react';
import { Form } from 'formsy-react';

import Card from 'components/card';
import Button from 'components/button';
import Input from 'components/forms/input';
import TransactionList from 'components/transaction-list';

import Buckets from 'collections/buckets';

import styles from 'sass/views/bucket.scss';


class Bucket extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = { alteredFilters: null, showSettings: false };
  }

  getMeteorData() {
    return {
      bucket: Buckets.findOne(this.props.params.id),
    };
  }

  handleSubmit({ name }) {
    const { bucket } = this.data;

    bucket.update({ name });

    this.setState({ showSettings: false });
  }

  onFiltersChange(filters) {
    this.setState({ alteredFilters: filters });
  }

  saveFilters() {
    const { bucket } = this.data;
    const { alteredFilters } = this.state;

    bucket.update({ filters: alteredFilters });

    this.setState({ alteredFilters: null });
  }

  render() {
    const { bucket } = this.data;
    const { showSettings, alteredFilters } = this.state;

    if (!bucket) return <div>Bucket not found.</div>;

    return (
      <div className={`container ${styles.root}`}>

        <div className='heading'>
          <Button onClick={()=> this.props.history.goBack()} className='back'>
            <i className='fa fa-long-arrow-left'/>
          </Button>

          <h1>{bucket.name}</h1>

          <Button onClick={this.setState.bind(this, { showSettings: !showSettings }, null)}>
            <i className='fa fa-cog'/>
          </Button>
        </div>

        <Card className={showSettings ? '' : 'gone'} expanded={true}>
          <Form onValidSubmit={::this.handleSubmit}>
            <Input label='Name' name='name' value={bucket.name} required/>
            <Button type='submit' variant='primary'>Save</Button>
            <Button onClick={this.setState.bind(this, { showSettings: false }, null)}>Cancel</Button>
          </Form>
        </Card>

        <TransactionList
          filters={alteredFilters || bucket.filters}
          onFiltersChange={::this.onFiltersChange}
        >
          {alteredFilters ?
            <Button variant='primary' onClick={::this.saveFilters}>
              <i className='fa fa-save'/>
              {' Save'}
            </Button>
          : null}
        </TransactionList>

      </div>
    );
  }
}

export default Bucket;
