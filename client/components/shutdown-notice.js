
import { Component } from 'react'

import Card from 'components/card'
import TextActions from 'components/text-actions'

class ShutdownNotice extends Component {
  render () {
    return (
      <Card style={{marginBottom: 48}}>
        <p><strong>Spendwell is shutting down</strong>. We want
        to say a big thank you to everyone who supported us, especially our beta
        users.</p>

        <TextActions>
          <a href='/spendwell-data.zip'>Export Your Data</a>
          <a href='/shutting-down'>Learn More</a>
        </TextActions>
      </Card>
    )
  }
}

export default ShutdownNotice
