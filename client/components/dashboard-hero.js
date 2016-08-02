import React from 'react'
import ReactDOM from 'react-dom'
import { Canvas, CanvasComponent, scales } from 'canviz'

import MonthSelector from 'components/month-selector'
import CardList from 'components/card-list'
import Card from 'components/card'

import style from 'sass/components/dashboard-hero'

const ONE_DAY = 1000 * 60 * 60 * 24;
let dummyData = [{
  lastMonth: 0,
  thisMonth: 0
}];
for (var i=0; i<30; i++) {
  dummyData.push({
    lastMonth: dummyData[i].lastMonth + Math.random() * 200,
    thisMonth: dummyData[i].thisMonth + Math.random() * 200
  });
}

export default class OverviewHero extends React.Component {
  constructor(props) {
    super(props);

    this.eventHandlers = [];
    this.canvas = null;
  }

  render() {
    const { summary, viewer, periods } = this.props;

    console.log(summary);

    return (
      <CardList className={`${style.root}`}>
        <MonthSelector
          month={periods.current}
          first={periods.first}
          onChange={(month) => browserHistory.push(`/app/dashboard/${month.format('YYYY/MM')}`)}
        />

        <Card>
          {/* <h1>Overview<small> your money this month</small></h1> */}

          <div className="contain">
            <div className="text">
              <h2>~$500<small> safe to spend</small></h2>
              <h2>$6000<small> income</small></h2>
              <h2>-$1000<small> for goals</small></h2>
              <h2>-$1500<small> for bills</small></h2>
              <h2>-$1000<small> for recurring spending</small></h2>
            </div>
            <div className="chart">
              <CanvasComponent autoresize={true} renderer={(c) => this.renderer(c)} />
            </div>
          </div>
        </Card>
      </CardList>
    );
  }

  renderer(c) {
    // Set up our common scales
    let scaleX = scales.numeric(
      dummyData.map(p => p.thisMonth),
      c.width
    );
    let scaleY = scales.numeric(
      dummyData.map(p => Math.max(p.thisMonth, p.lastMonth)),
      c.height * 0.8
    );

    function drawLastMonth() {
      c.save();

      let x = 0;
      let y = 0;

      c.lineWidth = 4;
      c.strokeStyle = c.fillStyle = 'rgba(56, 142, 60, 0.8)';
      c.beginPath();
      c.moveTo(0, c.height);
      dummyData.forEach(p => {
        y = c.height - scaleY.calc(p.lastMonth);
        x += scaleX.stride;
        c.lineTo(x, y);
      });
      // c.lineTo(x - scaleX.stride, this.canvas.height);
      // c.lineTo(0, this.canvas.height);
      c.stroke();
      // c.fill();
      c.restore();
      c.restore();
    };
    function drawThisMonth() {
      c.save();

      let x = 0;
      let y = 0;

      c.lineWidth = 4;
      c.strokeStyle = c.fillStyle = 'rgba(56, 142, 60, 0.6)';
      c.beginPath();
      c.moveTo(0, c.height);
      dummyData.forEach(p => {
        y = c.height - scaleY.calc(p.thisMonth);
        x += scaleX.stride;
        c.lineTo(x, y);
      });
      c.lineTo(x, c.height);
      c.lineTo(0, c.height);
      // c.stroke();
      c.fill();

      c.restore();
    };
    function drawGoal() {
      c.save();

      let y = c.height - scaleY.calc(scaleY.max * Math.random());
      let grad = c.createLinearGradient(0, 0, c.width, 0);
      grad.addColorStop(0, 'rgba(56, 142, 60, 0)');
      grad.addColorStop(0.5, 'rgba(56, 142, 60, 0.8)');
      grad.addColorStop(1, 'rgba(56, 142, 60, 0.8)');

      c.setLineDash([8, 4]);
      c.lineWidth = 4;
      c.strokeStyle = grad;
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(c.width, y);
      c.stroke();

      c.restore();
    };
    let drawLegend = () => {

    };

    drawThisMonth();
    drawLastMonth();
    drawGoal();
    drawLegend();
  }
}
