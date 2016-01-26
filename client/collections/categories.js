
import Model from './model';


class Category extends Model {
  children() {
    return this.collection.find({ parent: this._id }).fetch();
  }
}

const Categories = new Meteor.Collection('categories', {
  transform: (doc)=> new Category(doc, Categories),
});


if (Meteor.isServer)
  Meteor.publish('categories', ()=> Categories.find());

else if (Meteor.isClient)
  Meteor.subscribe('categories');


export default Categories;
