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
