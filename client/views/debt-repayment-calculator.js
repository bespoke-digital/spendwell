
import { Component } from 'react';
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

const delay = 300;

export default class DebtRepaymentCalculator extends Component {
  constructor() {
    super();
    this.state = {
      time: 'Months',
    };
    this.setPrincipleGraph = _.debounce(::this.setPrincipleGraph, delay);
    this.setRateGraph = _.debounce(::this.setRateGraph, delay);
    this.setPaymentGraph = _.debounce(::this.setPaymentGraph, delay);
    this.setNumberOfPaymentsGraph = _.debounce(::this.setNumberOfPaymentsGraph, delay);
  }

  handlePrincipleChange(principle) {
    this.setState({ principle });
    this.setPrincipleGraph(principle);
  }

  setPrincipleGraph(principleGraph) {
    this.setState({ principleGraph });
  }

  handleRateChange(rate) {
    this.setState({ rate });
    this.setRateGraph(rate);
  }
  setRateGraph(rateGraph) {
    this.setState({ rateGraph });
  }

  handlePaymentsChange(payment) {
    this.setState({ payment, numberOfPayments: null, numberOfPaymentsGraph: null });
    this.setPaymentGraph(payment);
  }

  setPaymentGraph(paymentGraph) {
    this.setState({ paymentGraph });
  }

  handleNumberOfPaymentsChange(numberOfPayments) {
    this.setState({ numberOfPayments, payment: null, paymentGraph: null });
    this.setNumberOfPaymentsGraph(numberOfPayments);
  }

  setNumberOfPaymentsGraph(numberOfPaymentsGraph) {
    this.setState({ numberOfPaymentsGraph });
  }

  handleDateToggle(time) {
    this.setState({ time });
  }

  render() {
    const { principle, rate, numberOfPayments, payment, time } = this.state;
    const { principleGraph, rateGraph, numberOfPaymentsGraph, paymentGraph } = this.state;
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
                    onChange={::this.handlePrincipleChange}
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
                    onChange={::this.handleRateChange}
                  />
                </Card>

                <Card>
                  <div className='double-card'>
                    <TextInput className = 'term'
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
                  <div className='or-icon'>
                    <div className='or'>
                      OR
                    </div>
                  </div>
                  <TextInput
                    label='Monthly Payment'
                    type='number'
                    step='0.01'
                    min='0.1'
                    value={payment}
                    onChange={::this.handlePaymentsChange}
                  />

                </Card>
              </CardList>
            </Col>

            <Col md='9' className='mui-container-fluid'>
              <CreateGraph
                className='graph-card'
                principle={parseFloat(principleGraph)}
                rate={parseFloat(rateGraph)}
                numberOfPayments={parseFloat(yearlyAdjustment(time) * numberOfPaymentsGraph)}
                payment={parseFloat(paymentGraph)}
              />
            </Col>

          </Row>
        </Container>
      </div>
    );
  }
}
