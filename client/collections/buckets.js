
import _ from 'lodash';
import moment from 'moment';

import Model from './model';
import Transactions from './transactions';


export class Bucket extends Model {
  static convertFilters = function(filters) {
    const processedFilters = filters.map((filter)=> {
      if (filter.type === 'name') {
        return { name: { $regex: filter.name, $options: 'i' } };

      } else if (filter.type === 'hidden') {
        filter = _.clone(filter);
        delete filter.type;
        return filter;

      } else {
        return filter;
      }
    });

    if (processedFilters.length === 0)
      return {};
    if (processedFilters.length === 1)
      return processedFilters[0];
    else
      return { $and: processedFilters };
  };

  constructor(...args) {
    super(...args);
    this.filters = this.filters || [];
  }

  update(data) {
    return Meteor.call('bucketsUpdate', this._id, data);
  }

  naturalFilters(extraFilters = {}) {
    return Bucket.convertFilters(this.filters.concat(extraFilters));
  }

  transactions(extraFilters = {}, ...args) {
    return Transactions.find(this.naturalFilters(extraFilters), ...args);
  }

  amount(month) {
    if (month)
      return this.amounts[month.format('YYYY-MM-00')] || 0;
    else
      return _.sum(this.amounts);
  }
}

const Buckets = new Meteor.Collection('buckets', {
  transform: (doc)=> new Bucket(doc, Buckets),
});


Buckets.sum = function(bucketList, month) {
  return bucketList.reduce((sum, bucket)=> sum += bucket.amount(month), 0);
};


Meteor.methods({
  bucketsCreate({ name, type, filters }) {
    const owner = Meteor.userId();
    if (!owner)
      throw new Meteor.Error('not-authorized');

    const bucketId = Buckets.insert({
      owner,
      name,
      type,
      filters,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    this.unblock();
    Meteor.call('bucketsAssign');

    return bucketId;
  },

  bucketsUpdate(_id, { name, filters }) {
    const owner = Meteor.userId();
    if (!owner)
      throw new Meteor.Error('not-authorized');

    Buckets.update({
      owner,
      _id,
    }, { $set: _.omit({
      name,
      filters,
      modifiedAt: new Date(),
    }, _.isUndefined) });

    this.unblock();
    Meteor.call('bucketsAssign');
  },

  bucketsAssign() {
    const owner = Meteor.userId();
    if (!owner)
      throw new Meteor.Error('not-authorized');

    Transactions.update({ owner }, { $unset: { bucket: null } }, { multi: true });
    Buckets.update({ owner }, { $unset: { amounts: null } }, { multi: true });

    Buckets.find({ owner }, { sort: ['createdAt', 'desc'] }).forEach((bucket)=> {
      Transactions.update(
        bucket.naturalFilters({ owner, bucket: null }),
        { $set: { bucket: bucket._id } },
        { multi: true },
      );

      const amounts = {};
      Transactions.find({ bucket: bucket._id }).forEach((transaction)=> {
        const key = moment(transaction.date).format('YYYY-MM-00');

        if (_.isUndefined(amounts[key]))
          amounts[key] = 0;

        amounts[key] += transaction.amount;
      });

      Buckets.update(bucket._id, { $set: { amounts } });
    });
  },

  bucketsFilterReset() {
    const owner = Meteor.userId();
    if (!owner)
      throw new Meteor.Error('not-authorized');

    Buckets.find({ owner }).forEach((bucket)=> {
      Buckets.update(bucket._id, { $set: { filters: [] } });
    });
  },
});


if (Meteor.isClient)
  Meteor.subscribe('buckets');

else if (Meteor.isServer)
  Meteor.publish('buckets', function() {
    return Buckets.find({ owner: this.userId });
  });

export default Buckets;
