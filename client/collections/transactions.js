
import moment from 'moment';

import Categories from './categories';
import Model from './model';


export class Transaction extends Model {
  category() {
    if (!this.categories || !this.categories.length) return;
    return Categories.findOne(this.categories.slice(-1)[0]);
  }
}

const Transactions = new Meteor.Collection('transactions', {
  transform: (doc)=> new Transaction(doc, Transactions),
});


Transactions.sum = function(transactionList) {
  return transactionList.reduce((sum, t)=> sum += t.amount, 0);
};


Meteor.methods({
  transactionsDetectTransfers() {
    const owner = Meteor.userId();
    if (!owner)
      throw new Meteor.Error('not-authorized');

    Transactions.update(
      { owner },
      { $set: { transfer: false, transferTo: null } },
      { multi: true },
    );

    Transactions.find({ owner, amount: { $gt: 0 } }).forEach((credit)=> {
      const debit = Transactions.findOne({
        owner,
        amount: -credit.amount,
        transfer: false,
        date: {
          $gte: moment(credit.date).subtract(3, 'days').toDate(),
          $lte: moment(credit.date).add(1, 'hour').toDate(),
        },
      });

      if (!debit) return;

      Transactions.update(credit._id, { $set: { transfer: true, transferTo: debit._id } });
      Transactions.update(debit._id, { $set: { transfer: true, transferTo: credit._id } });

      console.log(credit.name, '=>', debit.name);
    });
  },

  // transactionsInvert() {
  //   const owner = Meteor.userId();
  //   if (!owner)
  //     throw new Meteor.Error('not-authorized');

  //   Transactions.find({ owner: Meteor.userId(), uploaded: true }).forEach((transaction)=> {
  //     console.log('convert', transaction.amount, -transaction.amount);
  //     Transactions.update(transaction._id, { $set: { amount: -transaction.amount } });
  //   });
  // },

  // transactionsClear() {
  //   const owner = Meteor.userId();
  //   if (!owner)
  //     throw new Meteor.Error('not-authorized');

  //   Transactions.remove({ owner });
  // },
});


if (Meteor.isClient) {
  Meteor.subscribe('transactions');

} else if (Meteor.isServer) {
  Meteor.publish('transactions', function() {
    return Transactions.find({ owner: this.userId });
  });
}

export default Transactions;
