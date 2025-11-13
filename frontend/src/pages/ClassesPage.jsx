import { useState } from "react";
import TeacherModal from "../components/TeacherModal";

export default function ClassesPage() {
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Classes with their teacher photos
  const classes = [
    {
      name: "BJJ – Gi",
      description: `Traditional Brazilian Jiu-Jitsu focused on grips, leverage, and positional control using the kimono. Expect technique drilling, positional sparring, and rolling with emphasis on detail and discipline.`,
      teachers: [
        "https://randomuser.me/api/portraits/men/12.jpg",
        "https://randomuser.me/api/portraits/women/33.jpg",
      ],
    },
    {
      name: "BJJ – No-Gi",
      description: `Submission grappling with a faster pace and no uniform grips. Ideal for developing body control, wrestling transitions, and fluid movement under pressure.`,
      teachers: [
        "https://randomuser.me/api/portraits/men/21.jpg",
        "https://randomuser.me/api/portraits/men/45.jpg",
      ],
    },
    {
      name: "Yoga Flow",
      description: `A dynamic class combining balance, strength, and flexibility. Focuses on controlled breathing, mindful transitions, and postures that improve recovery and joint mobility.`,
      teachers: [
        "https://randomuser.me/api/portraits/women/55.jpg",
        "https://randomuser.me/api/portraits/women/66.jpg",
      ],
    },
    {
      name: "Strength & Conditioning",
      description: `Functional training to enhance explosive power, stability, and endurance. Includes kettlebells, mobility drills, and core circuits tailored for combat athletes.`,
      teachers: [
        "https://randomuser.me/api/portraits/men/77.jpg",
        "https://randomuser.me/api/portraits/men/88.jpg",
      ],
    },
  ];

  // Dummy bios (shared across all for now)
  const dummyTeacher = {
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity.",
  };

  return (
    <div className="flex flex-col items-center py-16 px-4">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">Our Classes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {classes.map((cls, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">
                {cls.name}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {cls.description}
              </p>
            </div>

            <div className="flex justify-center gap-4">
              {cls.teachers.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt="Teacher"
                  className="w-12 h-12 rounded-full cursor-pointer hover:scale-105 transition"
                  onClick={() =>
                    setSelectedTeacher({
                      name: "Instructor",
                      photo,
                      ...dummyTeacher,
                    })
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTeacher && (
        <TeacherModal
          isOpen={!!selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          {...selectedTeacher}
        />
      )}
    </div>
  );
}
