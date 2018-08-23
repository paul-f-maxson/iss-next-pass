import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import moment from 'moment';

function Display(props) {
  return (
    <div className="information-display" id="next-pass-display" >
      <h1>Next pass duration: {props.duration} seconds</h1>
      <h1>Next pass risetime: {props.risetime}</h1>
    </div>
  );
}

class PassFinder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nextPasses: {},
      nextPass: {
        riseTime: "loading...",
        risetime: "loading...",
        setTime: "loading...",
        duration: "loading...",
      },
    };
  }

  update () {

    let options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    let nextPasses = {};

    // Async API accesses
    let locateNavigator = new Promise( (resolve, reject) => (
      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    ));

    locateNavigator.then( position => {

        let passesHeaders = new Headers();
        // Headers required for the proxy
        passesHeaders.append("X-Requested-With", "fetch");
        passesHeaders.append("Origin","");

        let passesRequest = new Request(
          // Make request through a proxy
          `https://cors-anywhere.herokuapp.com/http://api.open-notify.org/iss-pass.json?lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
          {
            headers: passesHeaders,
          },
        );

        return fetch(passesRequest);
      })
      .then( passesResponse => passesResponse.json() )
      .then( passesObj => {
        nextPasses = passesObj;
        this.setState({
          nextPass: nextPasses.response[0],
        });
        // this.setState({ nextPass: {
        //   riseTime: nextrt,
        //   setTime: nextst,
        //   duration: nextdur,
        // } });
      })
      .catch( err => {
        console.error(`ERROR(${err.code}): ${err.message}`);
      });



    // Setting state with the results of the API requests
    // const nextrt = moment(nextPasses.response[0].risetime);
    // const nextdur = nextPasses.response[0].duration;
    // const nextst = rt.add(dur, "seconds");


  }

  componentDidMount () {
    this.update();
  }

  render () {
    return (
      <Display
        duration={this.state.nextPass.duration}
        risetime={this.state.nextPass.risetime}
      />
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <PassFinder />
      </div>
    );
  }
}

export default App;
