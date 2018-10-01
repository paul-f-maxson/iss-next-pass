import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import moment from 'moment';

const getCurrentPosition = (options = {}) => (
  new Promise( (resolve, reject) => (
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  ))
);

// TODO: Request position only in response to user gesture
class PassFinder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: undefined,
      longitude: undefined,
      altitude: undefined,
      nextPasses: [],
      permissionGranted: false,
      positionRequested: false,
      passesLoaded: false,
    };

    this.userRequestOwnGeoposition = (
      this.userRequestOwnGeoposition.bind(this)
    );
  }

  convertToRiseSet = (pass) => {
    // TODO: Implement
  };

  // TODO: Factor out everything except setting state
  updatePosition = async () => {

    // Set getCurrentPosition options
    const options = {
      enableHighAccuracy: true,
      timeout: 4000,
      maximumAge: 0
    };

    // Access getCurrentPosition API
    let position;
    let tryAgain = true;

    while (tryAgain) {
      try {
        position = await getCurrentPosition(options);
      } catch (e) {

        if (e.__proto__.constructor.name === "PositionError") {

          if (e.code === 1) { // PERMISSION_DENIED
            tryAgain = window.confirm(
              "We need your permission to access your location information! Try again?"
            );

          } else if (e.code === 2) { // POSITION_UNAVAILABLE
              tryAgain = window.confirm(
                "The acquisition of the geolocation failed because at least one source of position on your machine machine failed! Try again?"
              );

          } else if (e.code === 3) { // TIMEOUT
              tryAgain = window.confirm(
                "We're having trouble finding you! Try again?"
              );
          }

        } else throw e;
      }
    }

    // Extract location data and assign it to component state
    this.setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude,
      positionLoaded: true,
    });

  }

  // TODO: Factor out everything except setting state
  updatePasses = async () => {
    let passesHeaders = new Headers();
    // Headers required for the proxy
    passesHeaders.append("X-Requested-With", "fetch");
    passesHeaders.append("Origin", "");

    const passesRequest = new Request(
      // Make request through a proxy
      `https://cors-anywhere.herokuapp.com/http://api.open-notify.org/iss-pass.json?lat=${
        this.state.latitude
      }&lon=${
        this.state.longitude
      }`,
      { headers: passesHeaders },
    );

    let passesResponse;
    try {
      passesResponse = await fetch(passesRequest);
    } catch (error) {
      console.error(`ERROR: ${error.code} (${error.msg})`);
      throw error;
    }

    let passesObj;
    try {
      passesObj = await passesResponse.json();
      this.setState({
        nextPasses: passesObj.response,
        passesLoaded: true,
      });
    } catch (error) {
      console.error(`ERROR: ${error.code} (${error.msg})`);
      throw error;
    }
  }

  update = async () => {
    await this.updatePosition();
    await this.updatePasses();
  }

  userRequestOwnGeoposition = () => {
    this.setState({ positionRequested: true });
    this.update();
  }

  render () {
    if (!this.state.positionRequested) {
      return (
        <GeolocationRequestButton
          requestPosition={this.userRequestOwnGeoposition}
        />
      );

    } else {
      return (
        <PassesDisplay
          positionLoaded={this.state.positionLoaded}
          latitude={this.state.latitude}
          longitude={this.state.longitude}
          passesLoaded={this.state.passesLoaded}
          nextPass={this.state.nextPasses[0]}
        />
      );
    }
  }
}

// TODO: Style this button
function GeolocationRequestButton(props) {
    return (
      <button
        onClick={props.requestPosition}
      >Get Location Information
      </button>
    );

}

function PassesDisplay(props) {

  const positionDisplay = props.positionLoaded ?
    (
      <h1>Your location: latitude {props.latitude},
        longitude {props.longitude}
      </h1>
    ) :
    (<h1>Loading position data...</h1>);

  let nextPassDisplay;
  if (props.passesLoaded) {
    // TODO: Implement conversion as function
    let momentFmtString = "dddd, MMMM Do YYYY [at] h:mm a";
    let nextPassFmt = {};
    let riseTime = moment.unix(props.nextPass["risetime"]);
    nextPassFmt.riseTime = riseTime.format(momentFmtString);
    nextPassFmt.setTime = riseTime.add(props.nextPass["duration"], 'seconds')
      .format(momentFmtString);

    nextPassDisplay = (
      <h1>The next time the ISS passes over your location,{' '}
        it will rise on {nextPassFmt.riseTime}{' '}
        and set on{' '}
        {nextPassFmt.setTime}.
      </h1>
    );
  } else {
    nextPassDisplay = (
        <h1>Loading passes data...</h1>
      );
  }

  return (
    // TODO: Implement error boundaries
    <div className="data-display">
      {positionDisplay}
      {nextPassDisplay}
    </div>
  );

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
