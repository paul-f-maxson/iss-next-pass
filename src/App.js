import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import moment from 'moment';

const getCurrentPosition = async (options = {}) => (
  new Promise( (resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  })
);

const updatePosition = async () => {

  // Set getCurrentPosition options
  const options = {
    enableHighAccuracy: true,
    timeout: 4000,
    maximumAge: 0
  };

  // Access getCurrentPosition API
  let position;

  while (true) {

    try {
      position = await getCurrentPosition(options);
      break; // Leave while if no error
    } catch (e) {

      if (e.__proto__.constructor.name === "PositionError") {

        if (e.code === 1 // PERMISSION_DENIED
          && !window.confirm( // 'Cancel' --> false
            "We need your permission to access your location information! Try again?"
          )
        ) break; // Leave while

        else if (e.code === 2 // POSITION_UNAVAILABLE
          && !window.confirm( // 'Cancel' --> false
            "The acquisition of your geolocation failed because at least one source of position on your machine machine didn't work! Try again?"
          )
        ) break; // Leave while

        else if (e.code === 3 // TIMEOUT
          && !window.confirm( // 'Cancel' --> false
            "We're having trouble finding you! Try again?"
          )
        ) break; // Leave while

      } else throw e; // Leave while
    }
  }
  return position;
}

const updatePasses = async (latitude, longitude, altitude) => {

  // Headers required for the proxy
  let passesHeaders = new Headers();
  passesHeaders.append("X-Requested-With", "fetch");
  passesHeaders.append("Origin", "");

  // Make request through a proxy
  const passesRequest = new Request(
    `https://cors-anywhere.herokuapp.com/http://api.open-notify.org/iss-pass.json?lat=${
      latitude // Interpolate data into request
    }&lon=${
      longitude // Interpolate data into request
    }`,
    { headers: passesHeaders },
  );

  while (true) {
    try {
      const passesResponse = await fetch(passesRequest);
      break; // Leave while loop
    } catch (e) {
      if (!window.confirm("Encountered an issue during retrieval of passes information-- Retry?")) break; // Leave while loop
      else throw e;
    }
  }

  const passesObj = await passesResponse.json();

  return passesObj.response;
}

class PassFinder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: undefined,
      longitude: undefined,
      altitude: undefined,
      nextPasses: [],
      positionRequested: false,
      positionLoaded: false,
      passesLoaded: false,
    };

    this.userRequestOwnGeoposition = (
      this.userRequestOwnGeoposition.bind(this)
    );
  }

  convertToRiseSet = () => {
    // TODO: Implement
  };

  update = async () => {

    // Get user position
    const position = await updatePosition();

    // Extract location data and assign it to component state
    this.setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude,
      positionLoaded: true,
    });

    // Get the next passes over that location
    const passes = await updatePasses(
      this.state.latitude,
      this.state.longitude,
      this.state.altitude,
    );

    this.setState({
      nextPasses: passes,
      passesLoaded: true,
    });

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
        <Presentational
          positionLoaded={this.state.positionLoaded}
          passesLoaded={this.state.passesLoaded}
          latitude={this.state.latitude}
          longitude={this.state.longitude}
          nextPass={this.state.nextPasses[0]}
        />
      );
    }
  }
}

// TODO: Style this button
function GeolocationRequestButton(props) {
  return (
    <div>
      <p>We'd like to get your location information so we can find the next pass the ISS will make over your position.
      </p>
      <button
        onClick={props.requestPosition}
      >Get Location Information
      </button>
    </div>
  );
}

// TODO: round lat and long
function Presentational(props) {

  const positionDisplay = ( props.positionLoaded
    ? (
      <h1>Your location: latitude {props.latitude},
        longitude {props.longitude}
      </h1>
    ) : <h1>Loading position data...</h1>
  );

  // TODO: Implement conversion as function
  let nextPassDisplay;

  if (props.passesLoaded) {

    // Convert risetime and duration to rise and set time
    // and format the result
    let momentFmtString = "dddd, MMMM Do YYYY [at] h:mm a";
    let nextPassFmt = {};
    let riseTime = moment.unix(props.nextPass["risetime"]);
    nextPassFmt.riseTime = riseTime.format(momentFmtString);
    nextPassFmt.setTime = riseTime.add(
      props.nextPass["duration"],
      'seconds',
    ).format(momentFmtString);

    // Create markup with this moment
    nextPassDisplay = (
      <h1>The next time the ISS passes over your location, it will rise on {nextPassFmt.riseTime} and set on {nextPassFmt.setTime}.
      </h1>
    );

    // Create markup to indicate loading state
  } else nextPassDisplay = ( <h1>Loading passes data...</h1> );

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
