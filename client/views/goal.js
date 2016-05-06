
import { Component } from 'react';
import Relay from 'react-relay';
import moment from 'moment';

import App from 'components/app';
import Card from 'components/card';
import Money from 'components/money';


class CreateGoal extends Component {
  render() {
    const { viewer } = this.props;

    return (
      <App viewer={viewer} back={true} title={viewer.goal.name}>
        {viewer.goal.months.edges.map(({ node })=>
          <Card key={node.id}>
            <div><strong>
              {moment(node.monthStart).asUtc().format('MMMM YYYY')}
            </strong></div>
            <div>
              <strong>{'target: '}</strong>
              <Money amount={node.targetAmount}/>
            </div>
            <div>
              <strong>{'filled: '}</strong>
              <Money amount={node.filledAmount}/>
            </div>
          </Card>
        )}
      </App>
    );
  }
}

CreateGoal = Relay.createContainer(CreateGoal, {
  initialVariables: { id: null },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}

        goal(id: $id) {
          name

          months(first: 100) {
            edges {
              node {
                id
                monthStart
                targetAmount
                filledAmount
              }
            }
          }
        }
      }
    `,
  },
});

export default CreateGoal;
