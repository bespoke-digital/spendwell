
import Relay from 'react-relay';
import { Component } from 'react';


class Category extends Component {
  render() {
    const { category } = this.props;
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

Category = Relay.createContainer(Category, {
  fragments: {
    category: ()=> [1, 2, 3, 4, 5].reduce((fragment)=> Relay.QL`
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
  },
});


export default class CategoriesView extends Component {
  render() {
    const { viewer } = this.props;
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

CategoriesView = Relay.createContainer(CategoriesView, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        categories(topLevel: true, first: 1000) {
          edges {
            node {
              ${Category.getFragment('category')}
            }
          }
        }
      }
    `,
  },
});

export default CategoriesView;
