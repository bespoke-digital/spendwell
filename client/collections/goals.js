
import Model from './model';


class Goal extends Model {}

const Goals = new Meteor.Collection('goals', {
  transform: (doc)=> new Goal(doc, Goals),
});


Meteor.methods({
  goalsCreate({ name, amount }) {
    const owner = Meteor.userId();
    if (!owner)
      throw new Meteor.Error('not-authorized');

    return Goals.insert({
      owner,
      name,
      amount,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });
  },
  goalsUpdate(_id, { name, amount }) {
    const owner = Meteor.userId();
    if (!owner)
      throw new Meteor.Error('not-authorized');

    return Goals.update({ owner, _id }, {
      owner,
      name,
      amount,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });
  },
});


if (Meteor.isClient)
  Meteor.subscribe('goals');

else if (Meteor.isServer)
  Meteor.publish('goals', function() {
    return Goals.find({ owner: this.userId });
  });

export default Goals;
