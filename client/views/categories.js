
import Relay from 'react-relay';
import { Component } from 'react';
import reactMixin from 'react-mixin';
import relayContainer from 'relay-decorator';

import Button from 'components/button';


@relayContainer({ fragments: {
  category: () => [1,2,3,4,5].reduce((fragment)=> Relay.QL`
  fragment on CategoryNode {
    name
    children(first: 10) {
      edges {
        node {
          ${fragment}
        }
      }
    }
  }
`, Relay.QL`fragment on CategoryNode { name }`),
} })
class Category extends Component {
  render() {
    const { category } = this.props;
    console.log('category', category);
    return (
      <div>
        {category.name}
        {category.children.edges.length ?
          <ul>
            {category.children.edges.map((edge, index)=>
              <li key={index}><Category category={edge.node}/></li>
            )}
          </ul>
        : null}
      </div>
    );
  }
}

@relayContainer({ fragments: {
  viewer: ()=> Relay.QL`
    fragment on Query {
      categories(topLevel: true, first: 100) {
        edges {
          node {
            ${Category.getFragment('category')}
          }
        }
      }
    }
  `,
} })
export default class CategoriesView extends Component {
  render() {
    const { viewer } = this.props;
    console.log('viewer', viewer);
    return (
      <div className='container'>
        <ul>
          {viewer.categories.edges.map((edge, index)=>
            <li key={index}><Category category={edge.node}/></li>
          )}
        </ul>
      </div>
    );
  }
}
