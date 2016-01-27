
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
      <li>
        <strong>{category.name}</strong>
        {category.children.edges.length ?
          <ul>
            {category.children.edges.map((edge, index)=> (
              <Category key={index} category={edge.node}/>
            ))}
          </ul>
        : null}
      </li>
    );
  }
}

@relay({
  fragments: {
    categories: () => Relay.QL`
      fragment on CategoryNodeDefaultConnection {
        edges {
          node {
            ${Category.getFragment('category')}
          }
        }
      }
    `,
  }
})
class CategoriesView extends Component {
  render() {
    const { categories } = this.props;

    return (
      <div className='container'>
        <ul>
          {categories.edges.map((edge, index)=>
            <Category key={index} category={edge.node}/>
          )}
        </ul>
      </div>
    );
  }
}

class CategoriesRoute extends Relay.Route {
  static queries = {
    categories: ()=> Relay.QL`query {
      categories(parentExists: false)
    }`,
  };
  static routeName = 'CategoriesRoute';
}

export default ()=> (
  <Relay.RootContainer
    Component={CategoriesView}
    route={new CategoriesRoute()}
  />
);
