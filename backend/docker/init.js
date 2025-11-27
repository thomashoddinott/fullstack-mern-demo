db = db.getSiblingDB("bjj_academy");

// --- START: Class Generation Logic (Transformed from scheduledClasses.js) ---

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
  // Note: This returns a local time string, which is appropriate for UI display
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

// Loop to generate 200 classes
while (generatedClasses.length < totalClassesToGenerate && currentDate <= endDate) {
  const baseClass = uniqueBaseClasses[classIndex % uniqueBaseClasses.length];
  const startTime = new Date(currentDate);

  // Set the time based on the base class's offset
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

// Seed the new scheduledClasses collection with the generated data
db.scheduledClasses.insertMany(generatedClasses);
// --- END: Class Generation Logic ---


db.users.insertMany([
  {
    id: 0,
    name: "John Doe",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rank: "Blue Belt",
    status: "Active",
    subscription: {
      type: "Premium",
      expiry: "2024-03-15T00:00:00Z"
    },
    stats: {
      classes_this_month: 12,
      total_classes: 156,
      favorite_class: "BJJ Gi"
    }
  },
  {
    id: 1,
    name: "Jane Smith",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rank: "Purple Belt",
    status: "Active",
    subscription: {
      type: "Gold",
      expiry: "2025-06-01T00:00:00Z"
    },
    stats: {
      classes_this_month: 8,
      total_classes: 210,
      favorite_class: "BJJ No-Gi"
    }
  },
  {
    id: 2,
    name: "Peter Jones",
    avatar: "https://randomuser.me/api/portraits/men/19.jpg",
    rank: "White Belt",
    status: "Inactive",
    subscription: {
      type: "Basic",
      expiry: "2023-12-31T00:00:00Z"
    },
    stats: {
      classes_this_month: 0,
      total_classes: 5,
      favorite_class: "Yoga Flow"
    }
  }
]);

db.plans.insertMany([
  { id: "1m", label: "1 Month", price: "$99", details: "Monthly plan" },
  { id: "3m", label: "3 Months", price: "$150", details: "Quarterly plan" },
  { id: "12m", label: "12 Months", price: "$500", details: "Yearly plan" }
]);

// Seed classes collection
db.classes.insertMany([
  {
    name: "BJJ – Gi",
    description: `Traditional Brazilian Jiu-Jitsu focused on grips, leverage, and positional control using the kimono. Expect technique drilling, positional sparring, and rolling with emphasis on detail and discipline.`,
    teacherIds: [0, 1]
  },
  {
    name: "BJJ – No-Gi",
    description: `Submission grappling with a faster pace and no uniform grips. Ideal for developing body control, wrestling transitions, and fluid movement under pressure.`,
    teacherIds: [2, 3]
  },
  {
    name: "Yoga Flow",
    description: `A dynamic class combining balance, strength, and flexibility. Focuses on controlled breathing, mindful transitions, and postures that improve recovery and joint mobility.`,
    teacherIds: [4, 5]
  },
  {
    name: "Strength & Conditioning",
    description: `Functional training to enhance explosive power, stability, and endurance. Includes kettlebells, mobility drills, and core circuits tailored for combat athletes.`,
    teacherIds: [6, 7]
  }
]);

// Seed teachers collection
db.teachers.insertMany([
  {
    id: 0,
    firstName: "Rafael",
    lastName: "Santos",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity."
  },
  {
    id: 1,
    firstName: "Marcus",
    lastName: "Johnson",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity."
  },
  {
    id: 2,
    firstName: "Carlos",
    lastName: "Rodriguez",
    avatar: "https://randomuser.me/api/portraits/men/21.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity."
  },
  {
    id: 3,
    firstName: "Elias",
    lastName: "Thompson",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity."
  },
  {
    id: 4,
    firstName: "Maria",
    lastName: "Oliveira",
    avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity."
  },
  {
    id: 5,
    firstName: "Sophie",
    lastName: "Laurent",
    avatar: "https://randomuser.me/api/portraits/women/66.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity."
  },
  {
    id: 6,
    firstName: "Lena",
    lastName: "Mueller",
    avatar: "https://randomuser.me/api/portraits/men/77.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity."
  },
  {
    id: 7,
    firstName: "Yuki",
    lastName: "Tanaka",
    avatar: "https://randomuser.me/api/portraits/men/88.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity."
  }
]);