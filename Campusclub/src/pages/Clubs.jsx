import "../styles/Clubs.css";

function Clubs() {
  const clubs = [
    {
      name: "Coding Club",
      description: "Learn programming, web development and new technologies.",
      members: 50,
    },
    {
      name: "Sports Club",
      description: "Participate in various sports and fitness activities.",
      members: 80,
    },
    {
      name: "Photography Club",
      description: "Explore photography, editing and creative activities.",
      members: 35,
    },
    {
      name: "Music Club",
      description: "Join music events and improve your musical skills.",
      members: 40,
    },
  ];

  return (
    <div className="clubs-page">
      <h1>College Clubs</h1>
      <p className="club-subtitle">
        Explore clubs and join activities that interest you.
      </p>

      <div className="clubs-container">
        {clubs.map((club) => (
          <div className="club-card" key={club.name}>
            <div className="club-icon">🎓</div>

            <h2>{club.name}</h2>

            <p>{club.description}</p>

            <p className="members">
              👥 {club.members} Members
            </p>

            <button>Join Club</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Clubs;