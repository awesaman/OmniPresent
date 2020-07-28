import React, { Component } from 'react';
import Slide from './components/slide';
import './App.css';

class App extends Component {
  render = () => (
    <div>
      <Slide recognition={{ lang: 'zh-CN' }} />
    </div>
  );
}

export default App;
