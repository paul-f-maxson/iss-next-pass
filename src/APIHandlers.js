// import Log from "./Log.js";

const positionGetter = ( options = {} ) => (

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

    const getCurrentPosition = positionGetter(options);

    try {
      position = await getCurrentPosition;
      break; // Leave while if no error
    } catch (e) {

      switch (e.code) {

        case e.PERMISSION_DENIED:
          if (window.confirm( // 'Cancel' --> false
            "We need your permission to access your location! Please update the settings of your computer and/or browser to allow access to your location. \n\nTry again?"
          )) break;
          else throw e;

        case e.POSITION_UNAVAILABLE:
          if (window.confirm( // 'Cancel' --> false
            "The acquisition of your geolocation failed because at least one source of position on your machine machine didn't work! \n\nTry again?"
          )) break;
          else throw e;

        case e.TIMEOUT:
          if (window.confirm( // 'Cancel' --> false
            "We're having trouble finding you! \n\nTry again?"
          )) break;
          else throw e;

        default:
          throw e;
      }
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
