
import { Component } from 'react';
import reactMixin from 'react-mixin';

import Button from 'components/button';
import Categories from 'collections/categories';


@reactMixin.decorate(ReactMeteorData)
export default class CategoriesView extends Component {
  constructor() {
    super();
    this.state = { downloading: false };
  }

  getMeteorData() {
    return {
      categories: Categories.find({}).fetch(),
    };
  }

  componentDidMount() {
    if (Meteor.userId() !== Meteor.settings.public.adminId)
      throw new Error('not-authorized');
  }

  downloadCategories(event) {
    event.preventDefault();
    this.setState({ downloading: true });
    Meteor.call('downloadCategories', ()=> this.setState({ downloading: false }));
  }

  childrenOf(id) {
    const categories = this.data.categories.filter((category)=> category.parent === id);
    return <ul>
      {categories.map((category)=> (
        <li key={category._id}>
          {category.name} ({category.plaidId})
          {this.childrenOf(category._id)}
        </li>
      ))}
    </ul>;
  }

  render() {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-3'>
            <Button variant='primary' onClick={::this.downloadCategories}>
              {this.state.downloading ? (
                <i className='fa fa-spinner fa-spin'/>
              ) : (
                <i className='fa fa-arrow-circle-o-down'/>
              )}
              {' Download'}
            </Button>
            {this.childrenOf(null)}
          </div>
        </div>
      </div>
    );
  }
}
