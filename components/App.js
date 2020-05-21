import React, {Component} from 'react';

import SplashScreen from './splashScreen';
import Navigator from '../routes/LoginStack';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timePassed: false,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setTimePassed();
    }, 1200);
  }

  setTimePassed = () => {
    this.setState({timePassed: true});
  };
  render() {
    if (!this.state.timePassed) return <SplashScreen />;
    else return <Navigator />;
  }
}

export default App;
