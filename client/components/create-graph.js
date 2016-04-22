
import { Component, PropTypes } from 'react';
import React from 'react';
import { render } from 'react-dom';
import _ from 'lodash';
import 'sass/app';

import Money from 'components/money';
import style from 'sass/components/create-graph';

var computeSchedule = function(
  principle, 
  rate, 
  numberOfPayments, 
  payment, 
  paymentsPerYear
  ) {
  
  if (_.isUndefined(paymentsPerYear)) {
    paymentsPerYear = 12;
  }
  let totalSchedule = '';
  let remaining = principle;
  let totalInterest = 0;
  let principleSchedule = '';
  let actualTotal = 0;

  const schedules = {};
  const totalAmount = numberOfPayments * payment;
  const yAxisRatio = 100 / totalAmount;
  const xAxisRatio = 100 / numberOfPayments;

  for (let i = 0; i < numberOfPayments; i++) {
    const interest = remaining * (rate / 100 / paymentsPerYear);
    const subFromTotal = payment;
    const subFromPrinciple = payment - interest;
    actualTotal +=(remaining > payment ? payment : remaining + interest);
    remaining -=(payment - interest < remaining ? payment - interest : remaining);
    totalInterest += interest;
    totalSchedule = `${totalSchedule}l${xAxisRatio} ${subFromTotal * yAxisRatio} `;
    principleSchedule = `${principleSchedule}l${xAxisRatio} ${subFromPrinciple * yAxisRatio} `;
  }

  schedules.totalSchedule = `M0 0 ${totalSchedule} L0 ${totalAmount * yAxisRatio}`;
  schedules.principleSchedule = `M0 ${(totalAmount - principle) * yAxisRatio}${principleSchedule} L0 ${totalAmount * yAxisRatio}`;

  schedules.debtTotal = Math.round(actualTotal * 100) / 100;
  schedules.interestTotal = totalInterest;
  return schedules;
};


var paymentsGivenTime = function(principle, rate, numberOfPayments) {
  const monthlyRate = rate / 1200;
  const pvif = Math.pow(1 + monthlyRate, numberOfPayments);
  let payment = monthlyRate / (pvif - 1) * (principle * pvif);
  payment = payment < (principle * monthlyRate + .01) ? null : payment;
  return payment;
};

var timeGivenPayment = function(principle, rate, payment) {
  const monthlyRate = rate / 1200;
  const numberOfPayments = (Math.log(payment / (payment - (principle * monthlyRate)))) / 
    Math.log(1 + monthlyRate);
  return numberOfPayments;
};

var sufficientInput = function(principle, payment, rate, numberOfPayments) {
  //make sure enough fields are populated and that the loan can eventually be paid off
  const tempPayment = paymentsGivenTime(principle, rate, numberOfPayments);
  const tempNumberOfPayments = timeGivenPayment(principle, rate, payment);
  const resultOfComplexIfStatment = 
    _.isFinite(principle) &&
    _.isFinite(rate) &&
    (
      (_.isFinite(tempPayment) && 
      _.round(tempPayment, 2) > 0) || 
      _.isFinite(tempNumberOfPayments)
    );
  return resultOfComplexIfStatment;
}

var monthNames = [
  'Jan', 'Feb', 'Mar',
  'Apr', 'May', 'Jun', 'Jul',
  'Aug', 'Sep', 'Oct',
  'Nov', 'Dec'
];

export default class CreateGraph extends React.Component {
  static propTypes = {
    principle: PropTypes.number.isRequired,
    rate: PropTypes.number.isRequired,
    payment: PropTypes.number,
    numberOfPayments: PropTypes.number,
  };

  constructor() {
    super();
    this.state = {
      animateIn: null,
      emptyState: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    const{ principle, payment, rate, numberOfPayments } = nextProps;
    this.setState({ animateIn: false });
    if (sufficientInput(principle, payment, rate, numberOfPayments)){
      clearTimeout(this.timeout);
      this.setState({ emptyState: false, });
      this.timeout = setTimeout(()=> this.setState({ animateIn: true }), 10);
    }
  }

  shouldComponentUpdate(nextProps) {
    const{ principle, payment, rate, numberOfPayments } = nextProps;
    return sufficientInput(principle, payment, rate, numberOfPayments);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }
  
  render() {
    const { principle, rate, numberOfPayments, payment } = this.props;
    const { animateIn, emptyState } = this.state;
    const calcNumber = (_.isFinite(numberOfPayments) && numberOfPayments !== 0)
      ? numberOfPayments
      : timeGivenPayment(principle, rate, payment);
    const calcPayment = (_.isFinite(payment) && payment !== 0)
      ? payment
      : paymentsGivenTime(principle, rate, numberOfPayments);
    const schedule = computeSchedule(principle, rate, calcNumber, calcPayment, 12);
    const { debtTotal, totalSchedule, principleSchedule } = schedule;
    const principleTop = (1 - principle / debtTotal) * 100;
    const principleRatio = principle / debtTotal;
    const principleAdjustment = principleRatio > .92 ? 
      7.5 : principleRatio < .15 ? 
      -15 : 0;
    const tempDate = new Date();
    const startDate = monthNames[tempDate.getMonth()] + ' ' + tempDate.getFullYear();
    tempDate.setMonth(tempDate.getMonth() + calcNumber);
    const endDate = monthNames[tempDate.getMonth()] + ' ' + tempDate.getFullYear();
    const interest = debtTotal - principle;
    const principlePosition = { top: principleAdjustment + principleTop + '%' };
    const totalPosition = { top: '0' };
    return(
      <div className = {style.root}>
        <div className={(emptyState? 'graph-card empty-state': 'hide-me')}>
        <img className="empty-graphs" src={'/static/img/calculator-es.svg' }/>
          <div className='empty-text'>
            Fill out the form to see a beautiful chart.
            <div className='text-small'>
              Once you have entered in your debt repayment info, this area will become a chart with your debt broken down in detail.
            </div>
          </div>
        </div>
        <div className={emptyState? 'hide-me':'graph-card'}>
          <div className='graph-header'>
            <div className>
              <div className='text-small'>Monthly Payments</div>
              <Money amount={calcPayment * 100} abs={true} dollars ={true}/>
            </div>
            <div className='move-right'>
              <div className='text-small'>Interest Owed</div>
              <Money amount={interest * 100} abs={true} dollars ={true}/>
            </div>
          </div>
          <div 
            className={_.isNull(animateIn)?
              '': animateIn ? 
              'after-animation':'before-animation'
              }
            >
            <div className='scaling-graph'>
              <svg 
                className='graphs' 
                width = '100%' 
                height='100%' 
                viewBox='0 0 100 100' 
                preserveAspectRatio='none slice'
              >
                <path className='total-schedule' d={emptyState?'':totalSchedule} height= '500'/>
                <path className='principle-schedule' d={emptyState?'':principleSchedule}/>
                <line 
                  className='total-line' 
                  strokeDasharray='1, .75' 
                  x1='0' y1='0' 
                  x2='95' y2='0'
                />
                <path 
                  className='principle-line' 
                  strokeDasharray='1, .75' 
                  d={emptyState?'':`M0 ${principleTop} l70 0 l0 ${principleAdjustment} l25 0`}
                />
              </svg>
              <div className='offset-card' style={principlePosition}>
                <div className='text-small'>Debt Amount</div>
                <Money amount={principle * 100} abs={true} dollars ={true}/>
              </div>
              <div className='offset-card' style={totalPosition}>
                <div className='text-small'>Total Owing</div>
                <Money amount={debtTotal * 100} abs={true} dollars ={true}/>
              </div>
            </div>
            <div className='dates'>
              <div className='start-date'>{startDate}</div>
              <div className='offset-card end-date'>{endDate}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
