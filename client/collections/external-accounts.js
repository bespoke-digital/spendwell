
import _ from 'lodash';
import moment from 'moment';

import Model from './model';
import Transactions from './transactions';


export class ExternalAccount extends Model {}

const ExternalAccounts = new Meteor.Collection('externalAccounts', {
  transform: (doc)=> new ExternalAccount(doc, Buckets),
});


Meteor.methods({
  externalAccountsCreate({ name, filters }) {
    const owner = Meteor.userId();
    if (!owner)
      throw new Meteor.Error('not-authorized');

    const externalAccountId = externalAccounts.insert({
      owner,
      name,
      filters,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    this.unblock();
    Meteor.call('externalAccountsAssign');

    return externalAccountId;
  },

  externalAccountsUpdate(_id, { name, filters }) {
    const owner = Meteor.userId();
    if (!owner)
      throw new Meteor.Error('not-authorized');

    externalAccounts.update({
      owner,
      _id,
    }, { $set: _.omit({
      name,
      filters,
      modifiedAt: new Date(),
    }, _.isUndefined) });

    this.unblock();
    Meteor.call('externalAccountsAssign');
  },

  externalAccountsAssign() {
    const owner = Meteor.userId();
    if (!owner)
      throw new Meteor.Error('not-authorized');
  },
});


if (Meteor.isClient)
  Meteor.subscribe('externalAccounts');

else if (Meteor.isServer)
  Meteor.publish('externalAccounts', function() {
    return ExternalAccounts.find({ owner: this.userId });
  });

export default ExternalAccounts;
