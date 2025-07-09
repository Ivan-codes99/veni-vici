import { useState, useEffect } from 'react';
import './App.css';

const DOG_API_URL = 'https://api.thedogapi.com/v1/images/search?has_breeds=1';

function App() {
  const [currentDog, setCurrentDog] = useState(null);
  const [banList, setBanList] = useState([]); // array of banned values
  const [history, setHistory] = useState([]); // array of previous dogs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch a random dog, skipping banned breeds
  const fetchDog = async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;
    while (attempts < 10) { // avoid infinite loop
      try {
        const res = await fetch(DOG_API_URL, {
          headers: {
            'x-api-key': 'live_XYRNJtqZSuJGtreaoYlC5pKWxVyM71Fn3YDnTjSNWqboMSVWIBM9uQh6qlejTuOf'
          }
        });
        const data = await res.json();
        if (!data[0] || !data[0].breeds || data[0].breeds.length === 0) {
          throw new Error('No breed info found.');
        }
        const dog = data[0];
        const breed = dog.breeds[0];
        if (!banList.includes(breed.name)) {
          setCurrentDog(dog);
          // Add to history
          setHistory(prev => [dog, ...prev.slice(0, 9)]); // Keep last 10 items
          setLoading(false);
          return;
        }
        attempts++;
      } catch (err) {
        setError('Failed to fetch dog.');
        setLoading(false);
        return;
      }
    }
    setError('No more dogs available (ban list too restrictive?)');
    setLoading(false);
  };

  // Fetch on mount
  useEffect(() => {
    fetchDog();
    // eslint-disable-next-line
  }, []);

  // Handler for banning any attribute value
  const handleBan = (value) => {
    if (!banList.includes(value)) {
      setBanList([...banList, value]);
    }
  };

  // Handler for removing from ban list
  const handleUnban = (value) => {
    setBanList(banList.filter((b) => b !== value));
  };

  // Refetch when ban list changes (to avoid showing banned breed)
  useEffect(() => {
    if (currentDog && banList.includes(currentDog.breeds[0].name)) {
      fetchDog();
    }
    // eslint-disable-next-line
  }, [banList]);

  return (
    <div className="app-container">
      <h1>Dog Discoverer 🐶</h1>
      <button onClick={fetchDog} disabled={loading} style={{marginBottom: '1rem'}}>
        {loading ? 'Loading...' : 'Discover a Dog!'}
      </button>
      {error && <div className="error">{error}</div>}
      {currentDog && (
        <div className="dog-card">
          <img src={currentDog.url} alt="dog" className="dog-img" />
          <ul>
            <li>
              <strong>Breed: </strong>
              <span
                className="clickable"
                onClick={() => handleBan(currentDog.breeds[0].name)}
                title="Click to ban this breed"
                style={{ color: banList.includes(currentDog.breeds[0].name) ? 'gray' : '#667eea', cursor: 'pointer' }}
              >
                {currentDog.breeds[0].name}
              </span>
            </li>
            <li>
              <strong>Temperament: </strong>
              {currentDog.breeds[0].temperament ? (
                currentDog.breeds[0].temperament.split(', ').map((temp, index) => (
                  <span
                    key={index}
                    className="clickable"
                    onClick={() => handleBan(temp.trim())}
                    title="Click to ban this temperament"
                    style={{ color: banList.includes(temp.trim()) ? 'gray' : '#667eea', cursor: 'pointer' }}
                  >
                    {temp.trim()}
                  </span>
                ))
              ) : (
                'Unknown'
              )}
            </li>
            <li>
              <strong>Origin: </strong>
              <span
                className="clickable"
                onClick={() => handleBan(currentDog.breeds[0].origin)}
                title="Click to ban this origin"
                style={{ color: banList.includes(currentDog.breeds[0].origin) ? 'gray' : '#667eea', cursor: 'pointer' }}
              >
                {currentDog.breeds[0].origin || 'Unknown'}
              </span>
            </li>
          </ul>
        </div>
      )}
      <div className="ban-list-section">
        <h2>Ban List</h2>
        {banList.length === 0 && <div>No banned breeds.</div>}
        <ul className="ban-list">
          {banList.map((breed) => (
            <li key={breed} className="ban-item">
              <span
                className="clickable"
                onClick={() => handleUnban(breed)}
                title="Click to remove from ban list"
                style={{ color: 'white', cursor: 'pointer' }}
              >
                {breed}
              </span>
            </li>
          ))}
                </ul>
      </div>
      
      {/* History Section */}
      {history.length > 0 && (
        <div className="history-section">
          <h2>Discovery History</h2>
          <div className="history-grid">
            {history.map((dog, index) => (
              <div key={index} className="history-item">
                <img src={dog.url} alt={`Previous dog ${index + 1}`} className="history-img" />
                <div className="history-info">
                  <strong>{dog.breeds[0].name}</strong>
                  <small>{dog.breeds[0].origin || 'Unknown origin'}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
