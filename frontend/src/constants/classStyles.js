const classStyles = {
  "BJJ - Gi": {
    color: "bg-red-600",
    logo: "https://static.thenounproject.com/png/631848-200.png",
  },
  "BJJ - No-Gi": {
    color: "bg-gray-500",
    logo: "https://static.thenounproject.com/png/1995411-200.png",
  },
  "Yoga Flow": {
    color: "bg-green-500",
    logo: "https://static.thenounproject.com/png/1995732-200.png",
  },
  "Strength & Conditioning": {
    color: "bg-orange-500",
    logo: "https://static.thenounproject.com/png/1980371-200.png",
  },
};

function normalize(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getClassStyle(title) {
  if (!title) return { color: "bg-gray-400", logo: "" };
  // try exact
  if (classStyles[title]) return classStyles[title];

  const t = normalize(title);
  // try to find key that is contained in title or vice versa
  for (const key of Object.keys(classStyles)) {
    const k = normalize(key);
    if (t.includes(k) || k.includes(t)) return classStyles[key];
  }

  return { color: "bg-gray-400", logo: "" };
}

export { classStyles, getClassStyle };
