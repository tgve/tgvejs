import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import '@testing-library/jest-dom'

configure({ adapter: new Adapter() });
// plotly & some other package tests error fix
// https://github.com/plotly/react-plotly.js/issues/115
window.URL.createObjectURL = function() {};
