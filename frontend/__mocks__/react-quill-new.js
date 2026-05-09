// __mocks__/react-quill-new.js
const React = require('react');
module.exports = function ReactQuill(props) {
  return React.createElement('div', { className: 'mock-quill' }, props.value);
};
module.exports.Quill = {};