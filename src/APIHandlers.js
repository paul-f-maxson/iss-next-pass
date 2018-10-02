const getCurrentPosition = async (options = {}) => (
  new Promise( (resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  })
);

export const updatePosition = async () => {

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

export const updatePasses = async (latitude, longitude, altitude) => {

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

  let passesResponse;
  while (true) {
    try {
      passesResponse = await fetch(passesRequest);
      break; // Leave while loop
    } catch (e) {
      if (!window.confirm("Encountered an issue during retrieval of passes information-- Retry?")) break; // Leave while loop
      else throw e;
    }
  }

  const passesObj = await passesResponse.json();

  return passesObj.response;
}
