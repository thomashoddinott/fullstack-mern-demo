db = db.getSiblingDB("bjj_academy");

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