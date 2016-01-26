
const Institutions = new Meteor.Collection('institutions');


if (Meteor.isServer) {
  Meteor.publish('institutions', function() {
    return Institutions.find({ owner: this.userId });
  });

} else if (Meteor.isClient) {
  Meteor.subscribe('institutions');
}

export default Institutions;
