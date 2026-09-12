import "../styles/Clubs.css";
function ClubCard({ name, description, members }) {
  return (
    <div className="club-card">
      <div className="club-icon">🎓</div>
      <h2>{name}</h2>
      <p>{description}</p>
      <p className="members">👥 {members} Members</p>
      <button>Join Club</button>
    </div>
  );
}
export default ClubCard;