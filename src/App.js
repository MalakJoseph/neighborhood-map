import React, { Component } from 'react';
import './App.css';
import MapContainer from './MapContainer';

class App extends Component {
  state = {
    mapLoaded: false
  }

  componentWillMount() {
    this.setState({mapLoaded: true})
  }

  onClickMenu = () => {
    const list = document.querySelector('.list-view'),
          map = document.querySelector('#map');

    if (window.innerWidth < 800) {
      if (list.style.display === "none") {
        list.style.display = "block";
        list.style.width = "35%";
        map.style.width = "65%";
      } else {
        list.style.display = "none";
        map.style.width = "100%";
      }
    } else {
      if (list.style.display === "none") {
        list.style.display = "block";
        list.style.width = "20%";
        map.style.width = "80%";
      } else {
        list.style.display = "none";
        map.style.width = "100%";
      }
    }
  }

  render() {
    return (
      <main className="app" role="main">
        <div className="heading" role="heading">
          <button className="hamburger-icon" onClick={this.onClickMenu} tabIndex="0" aria-label="Menu Button">
            <i className="fa fa-bars" aria-hidden="true"></i>
          </button>
          <h1 className="title">Neighborhood Map</h1>
        </div>
        {this.state.mapLoaded ?
          <MapContainer/> : <div className="error" role="alert">Google Maps did not load.  Please try again later...</div>
        }
      </main>
    );
  }
}

export default App
