
import { Component, PropTypes } from 'react';
import { render } from 'react-dom';
import DebtRepaymentCalculator from 'views/debt-repayment-calculator'

window.onload = ()=> render(<DebtRepaymentCalculator/>, document.getElementById('root'));
