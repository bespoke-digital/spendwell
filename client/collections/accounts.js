
import Transaction from 'collections/transactions';


const Accounts = new Meteor.Collection('accounts');


Meteor.methods({
  disableAccount({ _id }) {
    if (!Meteor.userId())
      throw new Meteor.Error('not-authorized');

    Accounts.update({ _id, owner: Meteor.userId() }, { $set: { enabled: false } });
    Transaction.update({ account: _id, owner: Meteor.userId() }, { $set: { enabled: false } });
  },

  enableAccount({ _id }) {
    if (!Meteor.userId())
      throw new Meteor.Error('not-authorized');

    Accounts.update({ _id, owner: Meteor.userId() }, { $set: { enabled: true } });
    Transaction.update({ account: _id, owner: Meteor.userId() }, { $set: { enabled: true } });
  },
});


if (Meteor.isClient)
  Meteor.subscribe('accounts');

else if (Meteor.isServer)
  Meteor.publish('accounts', function() {
    return Accounts.find({
      owner: this.userId,
    });
  });

export default Accounts;
