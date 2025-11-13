import "./TeacherModal.css";

export default function TeacherModal({
  isOpen,
  onClose,
  name,
  photo,
  bio,
  quirkyFact,
}) {
  if (!isOpen) return null;

  return (
    <div className="teacher-modal-backdrop" onClick={onClose}>
      <div className="teacher-modal" onClick={(e) => e.stopPropagation()}>
        <button className="teacher-modal-close" onClick={onClose}>
          ×
        </button>
        <img src={photo} alt={name} className="teacher-modal-photo" />
        <h2 className="teacher-modal-name">{name}</h2>
        <p className="teacher-modal-bio">{bio}</p>
        <p className="teacher-modal-fact">💡 {quirkyFact}</p>
      </div>
    </div>
  );
}
