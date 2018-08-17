import { CLIENT_ID, CLIENT_SECRET } from './credentials/Credentials'

const api= 'https://api.foursquare.com/v2/venues'

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.status);
  } else {
  	return response.json()
	}
}

export const getLocationsAll = () =>
	fetch(`${api}/search?ll=30.029860,31.261105&intent=browse&radius=10000&query=cinema&limit=12&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=20180810`)
		.then(handleErrors)
		.then(data => data.response.venues)

export const getVenueDetails = (venueId) =>
	fetch(`${api}/${venueId}?&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=20180810`)
		.then(handleErrors)
		.then(data => data.response.venue)
