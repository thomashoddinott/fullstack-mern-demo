import { useState } from "react";
import TeacherModal from "../components/TeacherModal";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function ClassesPage() {
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const { data: classes, isLoading, isError } = useQuery({
    queryKey: ["classes"],
    queryFn: () => axios.get('/api/classes').then((res) => res.data),
  });

  // Dummy bios (shared across all for now)
  const dummyTeacher = {
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity.",
  };

  return (
    <div className="flex flex-col items-center py-16 px-4">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">Our Classes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {isLoading && <div>Loading classes...</div>}
        {isError && <div>Error loading classes</div>}
        {classes && classes.map((cls, i) => (
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
