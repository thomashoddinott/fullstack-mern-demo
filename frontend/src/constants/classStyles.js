import bjjGiLogo from "../assets/class-logos/BJJ - Gi.png"
import bjjNoGiLogo from "../assets/class-logos/BJJ - No-Gi.png"
import yogaFlowLogo from "../assets/class-logos/Yoga Flow.png"
import strengthLogo from "../assets/class-logos/Strength & Conditioning.png"

const classStyles = {
  "BJJ - Gi": {
    color: "bg-red-600",
    hexColor: "#DC2626",
    logo: bjjGiLogo,
    //ideally find a better gi logo from `vexels.com` to have consistent styling
  },
  "BJJ - No-Gi": {
    color: "bg-gray-500",
    hexColor: "#6B7280",
    logo: bjjNoGiLogo,
  },
  "Yoga Flow": {
    color: "bg-green-500",
    hexColor: "#22C55E",
    logo: yogaFlowLogo,
  },
  "Strength & Conditioning": {
    color: "bg-orange-500",
    hexColor: "#F97316",
    logo: strengthLogo,
  },
}

function normalize(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function getClassStyle(title) {
  if (!title) return { color: "bg-gray-400", logo: "" }
  // try exact
  if (classStyles[title]) return classStyles[title]

  const t = normalize(title)
  // try to find key that is contained in title or vice versa
  for (const key of Object.keys(classStyles)) {
    const k = normalize(key)
    if (t.includes(k) || k.includes(t)) return classStyles[key]
  }

  return { color: "bg-gray-400", logo: "" }
}

export { classStyles, getClassStyle }
