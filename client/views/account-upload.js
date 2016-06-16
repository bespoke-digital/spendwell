
import { Component } from 'react'
import Relay from 'react-relay'

import App from 'components/app'
import ListHeading from 'components/list-heading'
import Card from 'components/card'
import CardList from 'components/card-list'
import A from 'components/a'
import TextActions from 'components/text-actions'
import TransactionList from 'components/transaction-list'

import sendToast from 'utils/send-toast'
import { handleMutationError } from 'utils/network-layer'
import { UploadCsvMutation } from 'mutations/transactions'

import styles from 'sass/views/account-upload.scss'


class AccountUpload extends Component {
  state = { loading: false };

  handleFileUpload (event) {
    const { viewer } = this.props

    this.setState({ loading: true })

    const fileReader = new FileReader()
    fileReader.addEventListener('load', (event) => {
      Relay.Store.commitUpdate(new UploadCsvMutation({
        account: viewer.account,
        csv: event.target.result,
      }), {
        onFailure: (response) => {
          this.setState({ loading: false })
          handleMutationError(response)
        },
        onSuccess: () => {
          console.log('Success: CreateBucketMutation')
          this.setState({ loading: false })
          sendToast('CSV uploaded successfully')
        },
      })
    })
    fileReader.readAsText(event.currentTarget.files[0])
  }

  render () {
    const { viewer } = this.props
    const { loading } = this.state

    return (
      <App viewer={viewer} title={`Upload CSV for ${viewer.account.name}`} className={styles.root}>
        <CardList>
          <Card loading={loading}>
            <TextActions>
              <A onClick={() => this.refs.fileInput.click()}>Upload CSV</A>
            </TextActions>
          </Card>
        </CardList>

        <input
          type='file'
          ref='fileInput'
          onChange={::this.handleFileUpload}
          style={{ display: 'none' }}
        />

        {viewer.account.transactions ?
          <ListHeading>Uploaded Transactions</ListHeading>
        : null}
        <TransactionList
          transactions={viewer.account.transactions}
          viewer={viewer}
          months
        />
      </App>
    )
  }
}


AccountUpload = Relay.createContainer(AccountUpload, {
  initialVariables: { id: null },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        ${TransactionList.getFragment('viewer')}

        account(id: $id) {
          ${UploadCsvMutation.getFragment('account')}

          name

          transactions(first: 100, sourceExact: "csv") {
            ${TransactionList.getFragment('transactions')}
          }
        }
      }
    `,
  },
})

export default AccountUpload
