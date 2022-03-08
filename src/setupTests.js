import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@testing-library/jest-dom'

configure({ adapter: new Adapter() });
// plotly & some other package tests error fix
// https://github.com/plotly/react-plotly.js/issues/115
window.URL.createObjectURL = function() {};
