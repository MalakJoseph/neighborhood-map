import React, { Component } from 'react';
import './App.css';
import MapContainer from './MapContainer';

window.gm_authFailure = () => {
  const msg = document.getElementById('map');
  msg.innerHTML = `<h2>Authentication failure!</h2><p>Please check your API key again or the console for more details..<p>`;
  msg.classList.add("error");
  msg.style.height = "10%";
  msg.style.padding = "10px 0";
}

class App extends Component {
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
        <header className="heading">
          <button className="hamburger-icon" onClick={this.onClickMenu} tabIndex="0" aria-label="Menu Button">
            <i className="fa fa-bars" aria-hidden="true"></i>
          </button>
          <h1 className="title">Neighborhood Map</h1>
        </header>
        {navigator.onLine ?
          <MapContainer/> : <div className="error" role="alert">Google Maps did not load.  Please try again later...</div>
        }
      </main>
    );
  }
}

export default App
