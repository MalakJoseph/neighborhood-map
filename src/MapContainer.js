import React, { Component } from 'react';
import { GoogleApiWrapper } from 'google-maps-react';
import { MAP_KEY } from './credentials/Credentials';
import * as MapsDataAPI from './MapsDataAPI.js';
import Foursquare from './img/Foursquare-icon.png';

class MapContainer extends Component {
	state = {
		locations: [],
		query: '',
		markers: [],
		isInfoWindowOpened:true,
		infoWindow: new this.props.google.maps.InfoWindow({maxWidth: 350})
	}

	/**
	 * @description react lifecycle
	 */
	componentDidMount() {
		this.initMap();
		this.onListClicked();
		// Fetching locations through FS
		MapsDataAPI.getLocationsAll()
			.then(locations => {
				this.setState({locations});
				this.addMarkers(locations);
			})
			.catch((error) => {
				alert('Sorry!! Locations data will not be displayed. You can try later...');
	      console.log('Error while fetching locations from Foursquare', error);
		})
	}

	/**
	 * @description create the map with some predefined props
	 */
	initMap = () => {
		const mapConfig = {
			center: {lat: 30.029860, lng: 31.261105},
			zoom: 11,
			gestureHandling: "greedy"
		};

		this.map = new this.props.google.maps.Map(document.getElementById('map'), mapConfig);
	}

	/**
	 * @description add markers for each location & add some click events
	 */
	addMarkers = () => {
		const {google} = this.props,
					bounds = new google.maps.LatLngBounds();

		this.state.locations.forEach(location => {
			const position = location.location,
						title = location.name;
			// Create a marker per location coordinates
			const marker = new google.maps.Marker({
				position: {lat: position.lat, lng: position.lng},
				map: this.map,
				title: title,
				id: location.id,
				address: position.address,
				animation: google.maps.Animation.DROP
			});
			// Pushing the marker to the array of markers
      this.setState((state) => ({
        markers: [...state.markers, marker]
      }));
			// Adding a click listener to markers so they can trigger the infoWindow
			// And bounce the marker once
			marker.addListener('click', () => {
				this.populateInfoWindow(marker, this.state.infoWindow)
        marker.setAnimation(this.props.google.maps.Animation.BOUNCE)
        marker.setAnimation(null);
			});
			// Extending the boundaries of the map to display all the markers
			bounds.extend(marker.position);
		})
		this.map.fitBounds(bounds);
	}

	/**
	 * @description displaying a popup window that shows some info about the location
	 * @param marker - markers set to the locations coordinates
	 * @param infoWindow - the popup window binded to the marker
	 */
	populateInfoWindow = (marker, infoWindow) => {
		// Fetching venue details and use it to create infoWindow content
		MapsDataAPI.getVenueDetails(marker.id)
			.then(data => {
				if(data !== undefined && data !== null) {
    			const {isInfoWindowOpened} = this.state,
								{bestPhoto, rating, contact, canonicalUrl, tips} = data; // Destructuring

					marker.photo = bestPhoto ? `${bestPhoto.prefix}200x100${bestPhoto.suffix}` : process.env.PUBLIC_URL+'/no-photo-available.jpg';
					marker.rating = rating ? rating : 'Nothing to show';
					marker.phone = contact.formattedPhone ? contact.formattedPhone : 'Nothing to show';
					marker.tip = tips.count > 0 ? `"${tips.groups[0].items[0].text}"` : 'No reviews available';
					marker.url = canonicalUrl;

			    // Check to make sure the infoWindow is not already opened on this marker.
			    if (infoWindow.marker !== marker) {
			    	infoWindow.marker = marker;
			    	marker.infoContent = `<div class="infoWindow" role="contentinfo">
																		<h3>${marker.title}</h3>
			                              <img class="place-photo" src=${marker.photo} alt="An image of ${marker.title}" role="img">
			  														<p><strong>Address:</strong> ${marker.address} Cairo, Egypt</p>
			  														<p><strong>Rating:</strong> ${marker.rating} <i class="fa fa-star" aria-hidden="true" style="color:gold"></i></p>
			  														<p><strong>Phone:</strong> ${marker.phone}</p>
			  														<p><strong>Review:</strong> ${marker.tip}</p>
			  														<a href="${marker.url}" style="font-size:initial">See More..</a>
			    												</div>`;
			    	infoWindow.setContent(marker.infoContent);
			    	infoWindow.open(this.map, marker);
			      // Make sure the marker property is cleared if the infoWindow is closed.
			      infoWindow.addListener('closeclick', function() {
			        infoWindow.marker = null;
			      });
				    this.setState({isInfoWindowOpened: true});
			  	} else if (infoWindow.marker === marker && isInfoWindowOpened) {
			  		// Close infoWindow on clicking the same marker or same list-item
			      infoWindow.close();
				    this.setState({isInfoWindowOpened: !isInfoWindowOpened});
			  	} else if (!isInfoWindowOpened) {
			  		// Open infoWindow again on clicking the same marker or same list-item
			  		infoWindow.open(this.map, marker);
				    this.setState({isInfoWindowOpened: !isInfoWindowOpened});
			  	}
				}
			})
			.catch(error => {
	      console.log(`Error while fetching venue details FourSquareService may be unreachable or unavailable `, error);
        marker.infoContent =
      			 `<div class="error" role="alert">
                <h3>Requested details for ${marker.title} from Foursqaure has been failed !</h3>
                <p>Please ry again later...</p>
              </div>`;
        infoWindow.setContent(marker.infoContent);
        infoWindow.open(this.map, marker);
			})
	}

	/**
	 * @description using this function to filter locations according to
	 * 							what has been written in the search box
	 */
	changedQuery = (e) => this.setState({query: e.target.value})

	/**
	 * @description binding the list view when clicked to markers and infoWindow
	 *							and animate it with bouncing once
	 */
	onListClicked = () => {
		const showInfoWindow = (e) => {
			if (e.target && e.target.nodeName === "LI") {
				const {markers, infoWindow} = this.state;
				const markerIndex = markers.findIndex(m => m.title === e.target.innerText);
				this.populateInfoWindow(markers[markerIndex], infoWindow);
				markers.forEach(() => {
	        markers[markerIndex].setAnimation(this.props.google.maps.Animation.BOUNCE);
					markers[markerIndex].setAnimation(null);
				})
			}
		}

		document.querySelector('.list-items').addEventListener('keypress', e => {
			if (e.keyCode === 13) {
				showInfoWindow(e);
			}
		})

		document.querySelector('.list-items').addEventListener('click', e => showInfoWindow(e))
	}

	render() {
		const {locations, query, markers, infoWindow} = this.state
    if (query) {
      locations.forEach((location, i) => {
        if (location.name.toLowerCase().includes(query.toLowerCase())) {
          markers[i].setVisible(true);
        } else {
          if (infoWindow.marker === markers[i]) {
            // close the info window if marker removed
            infoWindow.close();
          }
          markers[i].setVisible(false);
        }
      })
    } else {
      locations.forEach((location, i) => {
        if (markers.length && markers[i]) {
          markers[i].setVisible(true);
        }
      })
    }

		return(
			<div className="container">
          <aside className="list-view">
          	<input role="search"
          				 placeholder="Search by name"
          				 type="text"
          				 aria-label="locations filter"
          				 value={this.state.query}
          				 onChange={this.changedQuery}
          	/>
          	<ul className="list-items" role="menu">
          		{markers.filter(m => m.getVisible()).map((marker, i) =>
          			(<li key={i}
        						 tabIndex="0"
        						 role="menuitem"
        						 aria-label={marker.title}>
        						 	{marker.title}
  						 	</li>)
						 	)}
          	</ul>
				    <footer id="footer">
			        <div className="signature">Created By Malak</div>
					    <div className="credits" alt="">Powered By <img src={Foursquare} className="fs" alt="Foursquare logo"></img> Foursquare</div>
				    </footer>
          </aside>
          <section id="map" role="application"/>
      </div>
    )
	}
}

export default GoogleApiWrapper({
  apiKey: (MAP_KEY)
})(MapContainer)
