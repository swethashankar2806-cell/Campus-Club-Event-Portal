
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Clubs.css';

function Clubs() {
  const navigate = useNavigate();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/clubs')
      .then((response) => {
        setClubs(response.data);
        setError('');
      })
      .catch((err) => {
        console.error('Error fetching clubs:', err);
        setError('Unable to load clubs. Please check your backend.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleJoin = (club) => {
    navigate('/join-club', {
      state: { club }
    });
  };

  if (loading) {
    return <p className="club-message">Loading clubs...</p>;
  }

  if (error) {
    return <p className="club-error">{error}</p>;
  }

  return (
    <div className="clubs-page">
      <h1>College Clubs</h1>

      <p className="club-subtitle">
        Explore clubs and join activities that interest you.
      </p>

      <div className="clubs-container">
        {clubs.length === 0 ? (
          <p>No clubs available at the moment.</p>
        ) : (
          clubs.map((club) => (
            <div className="club-card" key={club.id}>
              <div className="club-icon">
                {club.name === 'Coding Club'
                  ? '💻'
                  : club.name === 'Sports Club'
                  ? '🏆'
                  : club.name === 'Photography Club' ||
                    club.name === 'Media Club'
                  ? '📸'
                  : '🎵'}
              </div>

              <h2>{club.name}</h2>

              <p>{club.description}</p>

              <p className="members">
                👥 {club.members} Members
              </p>

              <button onClick={() => handleJoin(club)}>
                Join Club →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Clubs;
