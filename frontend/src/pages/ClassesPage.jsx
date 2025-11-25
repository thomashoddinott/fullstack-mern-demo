import { useState } from "react";
import TeacherModal from "../components/TeacherModal";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function ClassesPage() {
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const { data: classes, isLoading: classesLoading, isError: classesError } = useQuery({
    queryKey: ["classes"],
    queryFn: () => axios.get('/api/classes').then((res) => res.data),
  });

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => axios.get('/api/teachers').then((res) => res.data),
  });

  // Create a map of teachers by id for quick lookup
  const teacherMap = {};
  if (teachers) {
    teachers.forEach((teacher) => {
      teacherMap[teacher.id] = teacher;
    });
  }

  const isLoading = classesLoading || teachersLoading;

  return (
    <div className="flex flex-col items-center py-16 px-4">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">Our Classes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {isLoading && <div>Loading classes...</div>}
        {classesError && <div>Error loading classes</div>}
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
              {cls.teacherIds && cls.teacherIds.map((teacherId) => {
                const teacher = teacherMap[teacherId];
                return teacher ? (
                  <img
                    key={teacherId}
                    src={teacher.avatar}
                    alt={`${teacher.firstName} ${teacher.lastName}`}
                    className="w-12 h-12 rounded-full cursor-pointer hover:scale-105 transition"
                    onClick={() =>
                      setSelectedTeacher({
                        name: `${teacher.firstName} ${teacher.lastName}`,
                        photo: teacher.avatar,
                        bio: teacher.bio,
                        quirkyFact: teacher.quirkyFact,
                      })
                    }
                  />
                ) : null;
              })}
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
