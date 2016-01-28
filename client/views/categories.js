
import Relay from 'react-relay';
import { Component } from 'react';
import reactMixin from 'react-mixin';
import relay from 'relay-decorator';

import Button from 'components/button';


const categoryFragment = [1,2,3].reduce((fragment)=> Relay.QL`
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
`, Relay.QL`fragment on CategoryNode { name }`);


@relay({ fragments: {
  category: () => categoryFragment,
} })
class Category extends Component {
  render() {
    const { category } = this.props;
    return (
      <div>
        <strong>{category.name}</strong>
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

@relay({
  fragments: {
    viewer: () => Relay.QL`
      fragment on Query {
        categories(parentExists: false, first: 10) {
          edges {
            node {
              parent {
                id
              },
              ${Category.getFragment('category')}
            }
          }
        }
      }
    `,
  }
})
class CategoriesView extends Component {
  render() {
    const { viewer } = this.props;
    console.log('viewer', viewer);
    return (
      <div className='container'>
        <ul>
          {viewer.categories.edges.map((edge, index)=>
            <li key={index}>
              {edge.node.parent && edge.node.parent.id ? '1' : '0'}
              <Category category={edge.node}/>
            </li>
          )}
        </ul>
      </div>
    );
  }
}

class ViewerRoute extends Relay.Route {
  static routeName = 'ViewerRoute';
  static queries = {
    viewer: ()=> Relay.QL`query { viewer }`,
  };
}

export default ()=> (
  <Relay.RootContainer
    Component={CategoriesView}
    route={new ViewerRoute()}
  />
);
