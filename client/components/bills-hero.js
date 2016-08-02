import React from 'react'
import ReactDOM from 'react-dom'
import { Canvas, CanvasComponent, scales } from 'canviz'

import Button from 'components/button'
import Card from 'components/card'
import CardList from 'components/card-list'

import style from 'sass/components/bills-hero'

// You probably want these to be evently divisible by 2
const BAR_SIZE = 30;
const GUIDE_SIZE = 2;

export default class BillsHero extends React.Component {
  render() {
    return (
      <CardList className={`${style.root}`}>
        <Card>
          <h2>
            Bills<small> for monthly recurring expenses</small>
            <Button color="dark">See More</Button>
          </h2>
          <div className="chart" ref="chart">
            <CanvasComponent
              ref="canvas"
              autoresize={true}
              renderer={(c) => this.renderer(c)}
            />
          </div>
          {this.renderCta()}
        </Card>
      </CardList>
    );
  }

  renderCta() {
    if (this.props.data.length === 0) {
      return (
        <div className="cta">
          Bills help you track recurring spending like rent, utility
          payments, and other expenses that stay the same each month.
          <br />
          <Button color="dark">Create one</Button>
        </div>
      );
    } else {
      return (
        <div className="cta">
          <Button color="dark">Create bill</Button>
        </div>
      );
    }
  }

  renderer(c) {
    const names = this.props.data.map(node => node.bucket.name);
    const values = this.props.data.map(node => Math.abs(Math.floor(node.amount / 100)));

    let scaleX = scales.numeric(values, c.width * 0.7);

    function drawBars() {
      c.save();
      let maxBarX = scaleX.calc(scaleX.max);

      c.textBaseline = 'baseline'; // The only viably cross-platform value
      c.font = '16px "Open Sans"';
      c.fillStyle = 'rgba(255, 255, 255, 0.8)';
      c.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      c.lineWidth = GUIDE_SIZE;

      names.forEach((name, i) => {
        // Main bar
        let x = scaleX.calc(values[i]);
        c.fillRect(0, 0, x, BAR_SIZE);

        // Guide bar
        let guidePadding = GUIDE_SIZE * 4;
        let guideLength = Math.max(0,
          (GUIDE_SIZE * 2) // Minimum guide size
          + (maxBarX - x) // Remaining bar space
        );
        let guideY = Math.floor(BAR_SIZE / 2);
        let guideX = Math.floor(x + guidePadding);
        c.save();
        c.beginPath();
        c.setLineDash([GUIDE_SIZE * 3, GUIDE_SIZE * 2]);
        c.moveTo(guideX, guideY);
        c.lineTo(guideX + guideLength, guideY);
        c.stroke();
        c.restore();

        // Text
        let textX = guideX + guideLength + guidePadding;
        let textY = Math.floor((BAR_SIZE / 2) + 6);
        c.fillText(`${name} – $${values[i]} / month`, textX, textY);

        c.translate(0, Math.ceil(BAR_SIZE + BAR_SIZE / 2));
      });

      // Grab our total consumed height
      let usedHeight = c.currentTransform.f;
      c.restore();
      return usedHeight;
    }

    let usedHeight = drawBars();
    if (usedHeight !== c.height) {
      this.setHeight(usedHeight);
    }
  }

  setHeight(height) {
    let element = this.refs.chart;
    if (!element) {
      setTimeout(() => this.setHeight(height));
      return;
    }

    element.style.height = height + 'px';
    this.refs.canvas.canvas.size(this.refs.canvas.canvas.width, height);
    this.refs.canvas.renderCanvas();
  }
}
