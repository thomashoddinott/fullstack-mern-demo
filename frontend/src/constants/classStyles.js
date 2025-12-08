const classStyles = {
  "BJJ - Gi": {
    color: "bg-red-600",
    hexColor: "#DC2626",
    logo: "https://static.thenounproject.com/png/631848-200.png",
    //ideally find a better gi logo from `vexels.com` to have consistent styling
  },
  "BJJ - No-Gi": {
    color: "bg-gray-500",
    hexColor: "#6B7280",
    logo: "https://images.vexels.com/media/users/3/149933/isolated/preview/efc9a9eee3db068ec6f2839b1cc78d13-men-wrestling-silhouette.png",
  },
  "Yoga Flow": {
    color: "bg-green-500",
    hexColor: "#22C55E",
    logo: "https://images.vexels.com/media/users/3/130614/isolated/preview/4e81e83e192abbb5a774d503c9bc9387-girl-yoga-practice-silhouette.png",
  },
  "Strength & Conditioning": {
    color: "bg-orange-500",
    hexColor: "#F97316",
    logo: "https://images.vexels.com/media/users/3/144850/isolated/preview/1f31f857229d2c923623de9fd83850dc-bodybuilder-training-silhouette.png",
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
