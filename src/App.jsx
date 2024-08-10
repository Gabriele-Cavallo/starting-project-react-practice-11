import { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import Error from './components/Error.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import { updateUserPlaces } from './http.js';
import { fetchUserPlaces } from './http.js';

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  //Loading data state per indicare che sto recuperando i dati all'utente
  const [isFetching, setIsFetching ] = useState(false);
  //Error state per mostrare eventuali errori a schermo
  const [error, setError] = useState();

  useEffect(() => {
    async function fetchPlaces(){
      setIsFetching(true);
      try{
        const places = await fetchUserPlaces();
        setUserPlaces(places);
      }catch (error) {
        setError({message: error.message || 'Failed to fetch user places.'})
      }
      setIsFetching(false);
    }
    fetchPlaces();
  }, []);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    // In questo caso bisogna aggiungere un loader perchè fino a quando non
    // vengono ricevuti i dati in await il codice non procede
    // await updateUserPlaces([selectedPlace, ...userPlaces]);

    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });
    
    try{
      await updateUserPlaces([selectedPlace, ...userPlaces]);
    }catch(error){
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({message: error.message || 'Failed to update places.'});
    }
  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );

    try{
      await updateUserPlaces(userPlaces.filter(place => place.id !== selectedPlace.current.id))
    }catch(error){
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({message: error.message || 'Failedt to delete place.'})
    }

    setModalIsOpen(false);
  }, [userPlaces]);

  function handleError(){
    setErrorUpdatingPlaces(null);
  }

  return (
    <>
      <Modal onClose={handleError} open={errorUpdatingPlaces}>
        {errorUpdatingPlaces && <Error onConfirm={handleError} title="An error occoured!" message={errorUpdatingPlaces.message} />}
      </Modal>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="An error occurred!" message={error.message} />}
        {! error && (<Places
          title="I'd like to visit ..."
          fallbackText="Select the places you would like to visit below."
          places={userPlaces}
          loadingText="Fetching your places..."
          isLoading={isFetching}
          onSelectPlace={handleStartRemovePlace}
        />)}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
