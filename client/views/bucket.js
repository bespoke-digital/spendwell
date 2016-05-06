
import { Component } from 'react';
import Relay from 'react-relay';

import TransactionList from 'components/transaction-list';
import App from 'components/app';
import ScrollTrigger from 'components/scroll-trigger';

import styles from 'sass/views/bucket.scss';


class Bucket extends Component {
  loadTransactions() {
    const { relay } = this.props;
    const { transactionCount } = relay.variables;

    relay.setVariables({ transactionCount: transactionCount + 20 });
  }

  render() {
    const { viewer } = this.props;

    if (!viewer.bucket)
      return this.render404();

    return (
      <App viewer={viewer} back={true} title={viewer.bucket.name} className={styles.root}>
        <ScrollTrigger onTrigger={::this.loadTransactions}>
          <TransactionList
            viewer={viewer}
            transactions={viewer.bucket.transactions}
            months={true}
          />
        </ScrollTrigger>
      </App>
    );
  }

  render404() {
    const { viewer } = this.props;
    return (
      <App viewer={viewer} back={true} title='Bucket Not Found'/>
    );
  }
}

Bucket = Relay.createContainer(Bucket, {
  initialVariables: {
    id: null,
    transactionsCount: 20,
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        ${TransactionList.getFragment('viewer')}

        bucket(id: $id) {
          name
          transactions(first: $transactionsCount) {
            ${TransactionList.getFragment('transactions')}
          }
        }
      }
    `,
  },
});

export default Bucket;
