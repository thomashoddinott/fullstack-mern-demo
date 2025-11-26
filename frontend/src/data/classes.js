// Unique base classes extracted from the original list:
const uniqueBaseClasses = [
  {
    title: "BJJ - Gi",
    teacher: "Matteo",
    time_offset: { hours: 7, minutes: 0 }, // Using a fixed time for generation simplicity
    spots_available: 8,
    spots_total: 15,
    backgroundColor: "#7EC2B9",
  },
  {
    title: "BJJ - No-Gi",
    teacher: "Matteo",
    time_offset: { hours: 9, minutes: 30 },
    spots_available: 12,
    spots_total: 15,
    backgroundColor: "#C7E76D",
  },
  {
    title: "Yoga Flow",
    teacher: "Maria",
    time_offset: { hours: 8, minutes: 0 },
    spots_available: 5,
    spots_total: 10,
    backgroundColor: "#9DC4E5",
  },
  {
    title: "Strength & Conditioning",
    teacher: "John",
    time_offset: { hours: 10, minutes: 0 },
    spots_available: 15,
    spots_total: 20,
    backgroundColor: "#F7D47B",
  },
];

// Start generating from November 26, 2025
const startDate = new Date("2025-11-26T00:00:00");
// End date is December 31, 2025
const endDate = new Date("2025-12-31T23:59:59");
const totalClassesToGenerate = 200;

let currentClassId = 9;
let generatedClasses = [];
let currentDate = new Date(startDate);
let classIndex = 0;

// Helper to format date/time to ISO string "YYYY-MM-DDTHH:MM"
const toISOStringLocal = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

// Loop to generate 100 classes
while (generatedClasses.length < totalClassesToGenerate && currentDate <= endDate) {
  const baseClass = uniqueBaseClasses[classIndex % uniqueBaseClasses.length];
  const startTime = new Date(currentDate);

  // Set the time based on the base class's offset (maintaining 1hr difference)
  startTime.setHours(baseClass.time_offset.hours);
  startTime.setMinutes(baseClass.time_offset.minutes);

  const endTime = new Date(startTime);
  endTime.setHours(startTime.getHours() + 1); // Ensure 1 hour duration

  const newClass = {
    id: currentClassId++,
    title: baseClass.title,
    teacher: baseClass.teacher,
    start: toISOStringLocal(startTime),
    end: toISOStringLocal(endTime),
    spots_available: baseClass.spots_available,
    spots_total: baseClass.spots_total,
    backgroundColor: baseClass.backgroundColor,
  };

  generatedClasses.push(newClass);

  // Move to the next unique class type for the next iteration
  classIndex++;

  // Advance the date only after cycling through the unique base classes once
  if (classIndex % uniqueBaseClasses.length === 0) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

export const classes = [
  // Original classes (IDs 1-8) would be here if combining the lists
  ...generatedClasses
];