
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form } from 'formsy-react';
import { Input } from 'formsy-react-components';

import { get } from 'state/buckets';
import Card from 'components/card';
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
    this.props.dispatch(get({ id: this.props.params.id }));
  }

  handleSubmit(data) {}

  render() {
    const { bucket } = this.props;
    const { showSettings } = this.state;

    return (
      <div className={`container ${styles.root}`}>
        <div className='heading'>
          <h1>{bucket.name}</h1>
          <div>
            <a
              className='btn btn-default'
              onClick={this.setState.bind(this, { showSettings: !showSettings }, null)}
            >
              <i className='fa fa-cog'/>
            </a>
          </div>
        </div>

        <Card className={showSettings ? '' : 'hidden'}>
          <Form onValidSubmit={::this.handleSubmit}>
            <Input layout='vertical' label='Name' name='name' required value={bucket.name}/>
            <button type='submit' className='btn btn-primary'>Save</button>
          </Form>
        </Card>
      </div>
    );
  }
}

export default connect((state)=> ({
  bucket: state.buckets.get.bucket,
}))(Bucket);
