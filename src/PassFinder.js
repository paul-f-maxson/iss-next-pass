import React, { Component } from 'react';

import { updatePasses, updatePosition } from "./APIHandlers.js"
import Presentational, { GeolocationRequestButton } from "./Presentational.js"

export default class PassFinder extends Component {
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
