import React from 'react';
import moment from 'moment';

// TODO: Style this button
export function GeolocationPermissionRequest(props) {
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
export default function Presentational(props) {

  const positionDisplay = ( props.positionLoaded
    ? (
      <p>
        Your location: latitude {props.latitude},
        longitude {props.longitude}
      </p>
    ) : <p>Loading position data...</p>
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
      <p>
        The next time the ISS passes over your location, it will rise on {nextPassFmt.riseTime} and set on {nextPassFmt.setTime}.
      </p>
    );

    // Create markup to indicate loading state
  } else nextPassDisplay = ( <p>Loading passes data...</p> );

  return (
    // TODO: Implement error boundaries
    <div className="data-display">
      {positionDisplay}
      {nextPassDisplay}
    </div>
  );

}
