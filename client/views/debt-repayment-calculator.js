
import { Component, PropTypes } from 'react';
import React from 'react';
import { render } from 'react-dom';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import Container from 'muicss/lib/react/container';
import _ from 'lodash';
import 'sass/app';

import Card from 'components/card';
import CardList from 'components/card-list';
import TextInput from 'components/text-input';
import Dropdown from 'components/dropdown';
import A from 'components/a';
import CreateGraph from 'components/graph';
import style from 'sass/views/debt-repayment-calculator';

const yearlyAdjustment = function(time) {
  return time === 'Years' ? 12 : 1;
};

export default class DebtRepaymentCalculator extends Component {
  constructor() {
    super();
    this.state = {
      time: 'Months',
    };
  }

  handlePaymentsChange(payment) {
    this.setState({ payment, numberOfPayments: null });
  }

  handleNumberOfPaymentsChange(numberOfPayments) {
    this.setState({ numberOfPayments, payment: null });
  }

  handleDateToggle(time) {
    this.setState({ time });
  }

  render() {
    const { principle, rate, numberOfPayments, payment, time } = this.state;
    return(
      <div className={style.root}>
        <Container className='container'>
          <Row className='row'>
            <Col md='3'>
              <CardList>

                <Card>
                  <TextInput
                    label='Debt Amount'
                    type='number'
                    step='0.01'
                    min='0.1'
                    value={principle}
                    onChange={(principle)=> this.setState({ principle })}
                    autoFocus={true}
                  />
                </Card>

                <Card>
                  <TextInput
                    label='Interest Rate'
                    type='number'
                    step='0.01'
                    min='0.1'
                    value={rate}
                    onChange={(rate)=> this.setState({ rate })}
                  />
                </Card>

                <Card>
                  <TextInput
                    label='Monthly Payment'
                    type='number'
                    step='0.01'
                    min='0.1'
                    value={payment}
                    onChange={::this.handlePaymentsChange}
                  />
                  <div className="or-icon">
                    <div className="or">
                      OR
                    </div>
                  </div>
                  <div className='double-card'>
                    <TextInput
                      label='Term'
                      type='number'
                      step='1'
                      min='1'
                      value={numberOfPayments}
                      onChange={::this.handleNumberOfPaymentsChange}
                    />
                    <Dropdown className='dropdown' label={time}>
                      <A onClick={this.handleDateToggle.bind(this, 'Months')}>
                        Months
                      </A>
                      <A onClick={this.handleDateToggle.bind(this, 'Years')}>
                        Years
                      </A>
                    </Dropdown>
                  </div>
                </Card>
              </CardList>
            </Col>

            <Col md='9' className='mui-container-fluid'>
              <CreateGraph
                className='graph-card'
                principle={parseFloat(principle)}
                rate={parseFloat(rate)}
                numberOfPayments={parseFloat(yearlyAdjustment(time) * numberOfPayments)}
                payment={parseFloat(payment)}
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
