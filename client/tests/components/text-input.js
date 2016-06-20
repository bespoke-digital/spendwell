
import { expect } from 'chai';
import { mount } from 'enzyme';
import TextInput from 'components/text-input';


describe('<TextInput />', () => {
  it('should not have uncontrolled input console error. If console does not show this error, then the test has passed and TextInput is a controlled input.', () => {
    const wrapper = mount(<TextInput onChange={function onChange() {
      console.log('Check for uncontrolled error after this line:');
    }}/>);
    const input = wrapper.find('input');
    input.node.value = 'filler';
    input.simulate('change', input);
  });
});
