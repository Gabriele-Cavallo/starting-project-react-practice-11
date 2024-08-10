import { useState } from 'react';
import Places from './Places.jsx';
import Error from './Error.jsx';
import { useEffect } from 'react';
import { sortPlacesByDistance } from '../loc.js';
import { fetchAvailablePlaces } from '../http.js';

export default function AvailablePlaces({ onSelectPlace }) {
  //Loading data state per indicare che sto recuperando i dati all'utente
  const [isFetching, setIsFetching ] = useState(false);
  //Data state in cui memorizzo i dati
  const [availableplaces, setAvailablePlaces] = useState([]);
  //Error state per mostrare eventuali errori a schermo
  const [error, setError] = useState();

  useEffect(() => {
    //ASYNC call method
    async function fetchPlaces() {
      setIsFetching(true);
      
      try{
        const places = await fetchAvailablePlaces();

        navigator.geolocation.getCurrentPosition((position) => {
          const sortedPlaces = sortPlacesByDistance(places, position.coords.latitude, position.coords.longitude);
          setAvailablePlaces(sortedPlaces);
          setIsFetching(false);
        });

      }catch (error){
        setError({message: error.message || 'Could not fetch places, please try again later!'});
        setIsFetching(false);
      }
    };

    fetchPlaces();
    // FETCH call method
    // fetch('http://localhost:3000/places').then((response) => {
    //   return response.json()
    // }).then((resData) => {
    //   setAvailablePlaces(resData.places);
    // });
  }, []);

  if(error) {
    return <Error title="An error occourred!" message={error.message}  />
  }

  return (
    <Places
      title="Available Places"
      places={availableplaces}
      isLoading={isFetching}
      loadingText="Fetching place data..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
