import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import Button from 'components/button'
import Card from 'components/card'
import CardList from 'components/card-list'

import style from 'sass/components/labels-hero'

export default class LabelsHero extends React.Component {
  constructor(props) {
    super(props);

    // Bootstrap state
    this.state = {
      activeIndex: null
    }

    // Used to determine how to animate bars in (initial load vs
    // incremental additions).
    this.firstRender = true;
  }

  prepData() {
    var result = {
      total: 0,
      max: 0,
      maxPercent: 0,
      items: [],
    };

    // First pass on data
    this.props.data.forEach(node => {
      let dollars = Math.abs(node.amount / 100);
      let dollarsAverage = Math.abs(node.avgAmount / 100);

      result.items.push({
        name: node.bucket.name,
        dollars: Math.floor(dollars),
        dollarsAverage: Math.floor(dollarsAverage),
        percent: 0 // Calculated later
      });

      result.total += dollars;
      result.max = Math.max(dollars, result.max);
    });

    // Caclulate percentages
    result.items.forEach(item => {
      item.percent = item.dollars / result.total;
      result.maxPercent = Math.max(item.percent, result.maxPercent);
    });

    return result;
  }

  componentWillReceiveProps(nextProps) {
    this.firstRender = false;
  }

  render() {
    let labelCount = this.props.data.length;
    let ctaClass = [
      'cta',
      labelCount == 0 ? 'empty' : ''
    ].join(' ');

    return (
      <CardList className={`${style.root}`}>
        <Card>
          <h2>
            Labels <small>for tracking spending</small>
            <Button color="dark">See more</Button>
          </h2>

          {/* <div class="chart">...</div> */}
          {this.renderBars()}

          {/* CTA section, which has different content depending on how many labels exist */}
          {(() => {
            if (labelCount < 8) {
              return (
                <div className={ctaClass}>
                  <p>
                    Labels help you categorize your spending so that you can
                    track it month-by-month.
                  </p>
                  <p>
                    Try creating one!
                    <Button>OK fine</Button>
                  </p>
                </div>
              );
            } else {
              return <div className={ctaClass}><Button>Add Label</Button></div>
            }
          })()}
        </Card>
      </CardList>
    );
  }

  renderBars() {
    const data = this.prepData();
    const state = this.state;

    function barStyle(d, inverse = false, offset = 0) {
      let perc = d.dollars / data.max;
      if (inverse) {
        perc = 1 - perc;
      }
      perc -= offset;

      // Limit within 0.01 - 1
      perc = Math.min(perc, 1);
      perc = Math.max(0.01, perc);

      return {
        transform: 'scaleY(' + perc + ')'
      };
    }

    function cls(name, i) {
      if (state.activeIndex === null) {
        return name;
      } else {
        if (i === state.activeIndex) {
          return name + ' active';
        } else {
          return name+ ' inactive';
        }
      }
    }

    return (
      <div className="chart">
        <div className="hover-targets">
          {data.items.map((d, i) =>
            <div className="hover-target"
                 key={d.name}
                 onMouseEnter={(e) => this.onMouseEnter(i)}
                 onMouseLeave={(e) => this.onMouseLeave(i)} />

          )}
        </div>
        <div className="names">
          {data.items.map((d, i) =>
            <ReactCSSTransitionGroup key={d.name} {...this.transitionProps('anim-name', data, i)}>
              <label className={cls('', i)}>
                {d.name}
                <div className="info">
                  ${Math.floor(d.dollars).toLocaleString()}&nbsp;per&nbsp;month
                  <br />
                  {(d.percent * 100).toFixed(0)}%&nbsp;monthly
                </div>
              </label>
            </ReactCSSTransitionGroup>
          )}
        </div>
        <div className="bars">
          <div className="lines">
            {data.items.map((d, i) =>
              <ReactCSSTransitionGroup key={d.name} {...this.transitionProps('anim-line', data, i)}>
                <div className={cls('line', i)} style={barStyle(d, true, 0.02)}></div>
              </ReactCSSTransitionGroup>
            )}
          </div>

          {data.items.map((d, i) =>
            <ReactCSSTransitionGroup key={d.name} {...this.transitionProps('anim-bar', data, i)}>
              <div className={cls('bar', i)} style={barStyle(d)}></div>
            </ReactCSSTransitionGroup>
          )}
        </div>
      </div>
    );
  }

  /**
   * Generates transition properties for elements in `this.renderBars()`.
   *
   * This primarily exists for a bit of DRY and cleanliness, and also
   * because the exact animation logic changes depending on whether this
   * is the component's initial render, or if this is just new data
   * being added.
   */
  transitionProps(name, data, index = 0) {
    switch (name) {
      case 'anim-name':
      case 'anim-line':
        return {
          transitionName: name + (this.firstRender ? '-first' : ''),
          transitionAppear: true,
          transitionAppearTimeout: this.firstRender ? 300 + (data.items.length + 1) * 100
                                                    : 1
                                                    ,
          transitionEnterTimeout: 0,
          transitionLeaveTimeout: 0
        };

      case 'anim-bar':
        return {
          transitionName: name + (this.firstRender ? '-first' : ''),
          transitionAppear: true,
          transitionAppearTimeout: this.firstRender ? (300 + index * 100) : 1,
          transitionEnterTimeout: 0,
          transitionLeaveTimeout: 0
        }

      default:
        return {};
    }
  }

  // Events

  onMouseEnter(i) {
    this.setState({
      activeIndex: i
    });
  }
  onMouseLeave(i) {
    this.setState({
      activeIndex: null
    })
  }
}