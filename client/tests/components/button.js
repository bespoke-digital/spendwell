
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Button from 'components/button';

describe('<Button />', () => {
	it('should have preliminary class', () => {
        const wrapper = shallow(<Button />);
        expect(wrapper.hasClass('mui-btn')).to.equal(true);
	});
	it('should not be a floating action button', () => {
        const wrapper = shallow(<Button />);
        expect(wrapper.hasClass('fab')).to.equal(false);
	});
});

describe('<Button flat/>', () => {
    it('should NOT be a floating action button with flat style', () => {
        const wrapper = shallow(<Button flat/>);
        expect(wrapper.hasClass('mui-btn--fab')).to.equal(false);
        expect(wrapper.hasClass('mui-btn--flat')).to.equal(true);
    });
});

describe('<Button fab/>', () => {
	it('should be a floating action button', () => {
        const wrapper = shallow(<Button fab/>);
        expect(wrapper.hasClass('mui-btn--fab')).to.equal(true);
	});
});

describe('<Button fab plain/>', () => {
	it('should be a floating action button with plain style', () => {
	    const wrapper = shallow(<Button fab plain/>);
        expect(wrapper.hasClass('mui-btn--fab')).to.equal(true);
        expect(wrapper.hasClass('mui-btn--plain')).to.equal(true);
	});
});

describe('<Button fab disabled/>', () => {
	it('should be a floating action button with disabled style', () => {
        const wrapper = shallow(<Button fab disabled/>);
        expect(wrapper.hasClass('mui-btn--fab')).to.equal(true);
        expect(wrapper.hasClass('mui--is-disabled')).to.equal(true);
	});
});

describe('<Button fab loading/>', () => {
	it('should be a floating action button with loading style', () => {
        const wrapper = shallow(<Button fab loading/>);
        expect(wrapper.hasClass('mui-btn--fab')).to.equal(true);
        expect(wrapper.hasClass('mui-btn--can-load')).to.equal(true);
        expect(wrapper.hasClass('mui-btn--is-loading')).to.equal(true);
	});
});
