db = db.getSiblingDB("bjj_academy");

// --- START: Class Generation Logic (Transformed from scheduledClasses.js) ---

// Unique base classes extracted from the original list:
const uniqueBaseClasses = [
  {
    title: "BJJ - Gi",
    teacher: "Matteo",
    time_offset: { hours: 7, minutes: 0 }, // Using a fixed time for generation simplicity
    spots_booked: 8,
    spots_total: 15
  },
  {
    title: "BJJ - No-Gi",
    teacher: "Matteo",
    time_offset: { hours: 9, minutes: 30 },
    spots_booked: 12,
    spots_total: 15
  },
  {
    title: "Yoga Flow",
    teacher: "Maria",
    time_offset: { hours: 8, minutes: 0 },
    spots_booked: 5,
    spots_total: 10
  },
  {
    title: "Strength & Conditioning",
    teacher: "John",
    time_offset: { hours: 10, minutes: 0 },
    spots_booked: 15,
    spots_total: 20
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
while (
  generatedClasses.length < totalClassesToGenerate &&
  currentDate <= endDate
) {
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
    spots_booked: baseClass.spots_booked,
    spots_total: baseClass.spots_total
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
    rank: "Blue Belt",
    subscription: {
      status: "Inactive",
      plan_id: "1m",
      expiry: "2025-12-17T00:00:00Z",
      start: "2025-12-01T00:00:00Z",
    },
    stats: {
      classes_this_month: 12,
      total_classes: 156,
      favorite_class: "BJJ Gi",
    },
    booked_classes_id: [9, 13, 15],
  },
  {
    id: 1,
    name: "Jane Smith",
    rank: "Purple Belt",
    subscription: {
      status: "Active",
      plan_id: "3m",
      expiry: "2025-12-31T00:00:00Z",
      start: "2025-12-01T00:00:00Z",
    },
    stats: {
      classes_this_month: 8,
      total_classes: 210,
      favorite_class: "BJJ No-Gi",
    },
    booked_classes_id: [9, 13, 15],
  },
  {
    id: 2,
    name: "Peter Jones",
    rank: "White Belt",
    subscription: {
      status: "Inactive",
      plan_id: "12m",
      expiry: "2025-12-31T00:00:00Z",
      start: "2025-12-01T00:00:00Z",
    },
    stats: {
      classes_this_month: 0,
      total_classes: 5,
      favorite_class: "Yoga Flow",
    },
    booked_classes_id: [9, 13, 15],
  },
]);

db["user-avatars"].insertMany([
  {
    userId: 0,
    // run `base64 -i` on an image file to get base64 data
    avatar:
      "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",
  },
  {
    userId: 1,
    avatar:
      "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",
  },
  {
    userId: 2,
    avatar:
      "/9j/4AAQSkZJRgABAQEAZABkAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCACAAIADAREAAhEBAxEB/8QAHAAAAgMBAQEBAAAAAAAAAAAABgcDBAUIAQIA/8QAOxAAAgEDAgQEAwUGBgMBAAAAAQIDBAURAAYHEiExEyJBUWFxgQgUMpGxI0JSYqHRFRYkQ8HwU3KC4f/EABoBAAMBAQEBAAAAAAAAAAAAAAMEBQIGAQD/xAAwEQACAgIBAwMDAgYCAwAAAAABAgADBBEhEhMxBUFRFCJxYZEyQoGhsfAV4SPB0f/aAAwDAQACEQMRAD8ASFuulbR13KlTIMHAHNpBkVl8RxftaOXZ3GrdFrpkglu1TOkYCgTSc+Pz1OuosJ+xiP6mOp2dfcojP2jLuTiTTNeBuqttESMUjkpDiRvf4Aa+w8Fi5dmO/nn/AOxbMzK6x20QRIfaC2ff9u33mue4pr3HMoZJ5yVfr7jJ6/LVRayjaMnJer8Aai52Rtq+X++iO1UzzmM+dseVfroOdfVTX951HcSl7bNqPE6BsHCPeNbQc5FNEFHQPnza5BsmsWbUEy5ayqvQzAGJLirZLpYdwPaL1QtTVCnKsR5XHup9ddZ6dfXbV1If+pzuTUyPzKnDvZd23fuGOzWaPxJn6szdFjX+Jjp1m9hAnSjZnT3D3gbfdoo1eKugqWPMWSTyMQVx0IyO/bONERnTkQFiCzyJpbxikuNuWhNMBWReUo3l64wVJ0NswHgT5cM63ObN0bFr6SWorCUPM5Z0UfhzoRvGtmPJjEDUW96s1Qs5yp0VbhMNjsJSpqaemb8JxoqWiBakwwsu0d6Xjbc98tu2LvW2uNmVqqCmZ4wV/F26nHqQCBr0unVsmaAbp1ACtRlqpFcEEMcgjtp9DFiPmRDpogMwYd3yWKKYtGctnXO1AnzLl3T7SmlcxBw3ropUQIeHHDjiTvXabtSbdr4/BmbmamqIVmjLduYA9QfiCNeD7f4T5gra1cbaXuIg4mbmqIbruOgnEEzhRKkBWNc9Pp9daZgoLGLVivq6QZ1bwF2NbtvbWpuSnTxXQM7EdSca41C/qOSeo8S/lOMZBVXGtSxJHHyqoA+Wun9MxK6qjxJFjljsxY/aN2Jad17DrZqiBFrKSJpqefHmRlGe/tpD1Cr6HIXIp4DHRHsY3it3QaX8e36Gc2/Z9sfEWzVD7rsm0a+6WieLkdo2SNnCtkNFzEcxBB7Ag9Rqs7gnjnXxFDWGA51D+5faBqKgS2sWmWMRsVDTHw5EYHqroO+D6ZB0F7rCo14jVOKCfuMHBvK4V8xmeXLsSebHXrqc5YHe5aqxq9an05e4IyyYPP36d9Aa1vEbXFUTJrNmQ1J5vD6n4a8GWyz5sVT5mRWbBVT0j/poy5xgGwVMenBze67N4c01mutiub01vaRaeppafmjkVnL4YkgBgWIz2PTTS+pDp6BJWR6ce59pH4nMPFGwLfd5XK80NuNHBVTGRYcDy5+Wn8TLFdYQmYycBnbqEFrpserp4RIIz2GemnkzlMTs9OdRuZlX4kkjZJPXS41PG3K+XjBODr7UxyJt7Iu0tt3JR1gozWLHKGeEHq4z1wfQ/PXxr3wJixtqRudF7s4o2mDbihbddg06gKk9CyAdepLnynHwJ17cGKlAPMSpB6wfgx/cIdw0F62vST0sqMDGOx+GuLwbPpL2WwanSZ9fXqxeQYcwyDByddJg5icqTJbKYB8a75TU+2JrSsyipr42iQZGQCOp1I9Zz1tsVK+Qp2ZU9LxWdi54ESEvGC97X2rQbftkkMDUFJHSwqKQSEBBgF2Pl5iMdBr6jMy34VtL/T/v943bg49QJYEmLfdO4Ya64y3O400M1wq3Ms08VMql3IGSQQB7dtbqWwknqP7zIZVAAWVIblRoniRshx3IUofqPTRelyeYzXcom/ZL9TBl/aj66C1RjyWgiHNuu0YUBgDoRrIhSQRL81XTTADy6BYDNIs3aC/VMNElJHJ+wWLwhH3UrjBGPjr5bnVekHj4i9mDWzdRHMyZdlSVFvNckMLxBeYqJVLhfcr3xrK3H2mjZX19B3+3H7zPr9s009MU8MHRRksIRqQ05erII4SW5iTnBGulR9zj2ABlKZYyOnQ6KDMEAzc4c1tvtG6qSsuULS0gkHicicxAz3x6/LRUs6TuL30llOp0lv3iFsefZc1JHdqGsMseEgVvPn3KEZXHxGjWXKw0JPWpt+Iv+A290sFwkhSp8Onlcnwmbyg/D21zfrGN3D1gczp/TCvQa2M6GPEmkgtctT4ykopYpzZOANQjTYBHji0u3ETlwvFx3ZuRKitD+aUMYyrc8K56AgYx6fHHp668asVIdef8ypRUAAAJavGyLndLglRJb5EHKuCxAD+oPXJ6j3Os039lenc+dFtPmbdm4Wx/cJK+thAVOoBbt/fW2ybCu18RcdpXCe8H94bUsM9I8QphFPjCMvQj/vtomPk2q29w1lKMNERE7hNbt65NTScwXPlJ9RrpKCtydUi2u2O2jCfhpu1au4izVtTyNMQKYv25v4c+mdfNjDzMNnkDcOdw1dRaXy/4ffOlbMT4j2N6gGHM/UO5cKrF+h9dJHH5lIXgw023f4zbJ6hqV541kEckqf7ZYEr17jsfgcHRaalVG602Pn3E8Zw7hQ2jNGhuEUwAMqqMeupTAxzXxOQrgzy3IRucLzdgMa66v+Hc4SzfVCB7VSfcA3KuOX8Xx1oPzAlW3LnCg2Wm3tRm+vFFRmQAvKcIP/Y+g03iugtBfxA5aWGo9PmdRcTjs6q2LIlWLVMnh/sCrRsQf5SP+NW7mxypY6P7SFULC4C+Zx3d6Y0tcrUzFUL+XlOOmemoRdGEvqti+Y5uDNIbpuumhqiZI0iMkise6rj/APB9dQPWj00AL7mWPSATaxPnXEfE1ut81YawwRiYgAsoxnHTr79sa5XZA1OlQsg0J5crnTTzHxApeNQnbpgfLWuW5n1NHbHEwLpfhBEYlZvDP7oPTRkQmelQDuAd0uBqqosG8vc504iaEA7Rb8VrLNcbUbjGo54ScgDqRqpg3LW/T8yVn1F06h7RKVc1RTOrqzRyRsGVx3B7g6vqAxkAsRG3Wburty2q1T1kgeb7miTyKMeLICQWI9z00qqit2X23GQSyhh5hNwj/wAu1G8qBN1Fv8IWT9uOvL2PLzY68nNjOPTOvHRNgnxDC23p0vmN3eFttGzLuZNlXSmrKC7xFau3lhPHGoOVYMD0GScAnI6+mk1vfEdghDAj9x+sfxQ2UB3QQV8GSUdltJ29DXU9zVqho1E1OzBZIpP3gFPVl9iPTUK7YOxrX9/2liq+zuFGU/ofYj8/M5QktlTUXRJWp5vBLjmPIQMZ666itlA0TOVsRySQI+amkoG2dLAaFDSCnITlQHrjpjHXOdXbnxlp5I1qRq0uazgHcVdisczV3+oo2dQPL0zqMlib8y32n3yJubltENHBHLDSQxMB1woU4+msNYpP6xs1jpmXR7bnuUSPhQ2QfN3Os95VOop2naNTgRQNDvGsDqMx0LDm9Fyy/wBjqX6xYDjgfr/6jvp69NpP6RtVt1t1IxSWVcgd865hVJnQrW55mLPcrKA0k8gVW64zjOihG9obTamZcTaq1AlM6CQ+7Y0ZOoeYNxF/ueB6CQBuXmJ/dOn6D1RO0agZuK8wfdBSyMSJG9/XT9NJLbEm32ADUVW56OMSF6cgqTkDVqljrmQrRozY2ZyrRRRt0HKSB9ToWT8xjCIOxHF9n7Z53jvCSg8VYqemhNRPIRkhcgAAepJI/roYqe77QdRh7lo+7W4+7xwwa00VTVUElPLDAhk5CCrsoGT8M6Su9OyKlZwwIH7xqj1St2VGXRP7QUtc0dNVQVkaRuYnDqrjKnHXqPbUQuQwIl9q+tCpPmLmKCE0vKUjYkdAOuqQ4keFFkghjt8aqsahQSwx6/AaTsY9W4woAEGrtQVDTSyLA0KFyVynTGm0uUTBHEwNw2it8ITTQzorjyEp0Px01Tep94papkdg++Q8qvE5A6ZGtWEHxMpN6rW627btwvFrrpaWdp4oWVFyZAQxCgfPGk8hksdK7BxyY1iow6mXzE9ct33eC8yLcKy4vOww4dCp5fbGB8tU68KsoCgEA2bYlmmJ3DTjNDf9rT0cdZUMsFXTpJEvMTy9AeU+udI+n9u4HQ5EdzrynKngxe0m9rtQIOS8VMcbtgBgGBPwzqicGuw7KyV9a6+WhBY94V12kWnrqxKgMcLIe4PsdL2YiV8qNQ1eQzcE7mhfqRJKBy4GYxz5HXBGs1vppq5dqYAOHlnaMBnc9FUDJY+wGqgOhIzAseJel+8WSvigqaaSEPAhUOuPn9QT1143TaNqdzygPQdWDW4zfs/btuth3utZaVErzRtFJCw8siEgkH26gHPpjQHsagdS+Y4ta5HDR98RuK8t1sBtENtnt00rp4jicMGUZ5l6AHB6f86Wy8tr6+jWv6xrCwRTb1sdxfwXzlQAtjUZqTOhV4zLFtS2qqkwKce41Ma9z7xHQXmF1JYbbFHn7vEuB7DQ975JizZDA6WLriluPb23KulkrVjMCSqZFVcnGevT105iY9l5ISFsuFSBnmTvjintB9ryxJdbdVyTKBTxxSq7c2ehwPwgfHHtqjiYN3c5XWonkZdKpsMDF7aN62mRghaLJPTI1e+kkv6wR3cNIrfX7fFSFiCVU5yTjHl8uuV9YQfUBPgf5lnCscU9xZQqOEu1q3dVJcKpJ6hop1l5HnLJhWBGR6r8NDry7VXtg8GPW3qydZXn2/MFePO2E3vehQyho2j6QygjyN9e49NNYeV9PthPPpEtoVDA21fZruc9EJay+W+HB/AYCzfrpw+sgH7V/vE2w6kIQnf9P+5Hc+G9k2jULBU29aiUg8s+cFj7j+2hjOsv8NCfRog2IM7ixHFJDGpCyoRkrpqgbIJgbhoERe1FFWUFTTSEmB6hz4Mp7Lj2Pof76pdatsedRGusoQfczy/WqpoxGtVIZP8AUFo5Mkh1K9WGfj+miY1qtsiDzkIC7+TDjgzWLZ7/AA1xXnTlKtjqQD66BltCYibjVvk9Fc5/FhjIyOpxjOpL2cyzTUQOYO3CmkRSUJ6ayHB8xkrxHjZK+okIDTKg9h11BdNQG4UAc9EzB3c49TjXtVJfkQROmiD4ibdN53A6StzhT5VJzjXR+lt2h0gRLOHWNmBtbwT+9TmeLKs38Or627nP2V+4n2ODl0h5GilfC9e2iKpMD1FTNnct4vOweG9tt0c7JO0sy59erls/kdc3kYi3Zzhx7D/E7D0/KFWArjzyP7yfhRxOm29sSqvl2oq+plrLi8DVj4ZeUIORRk9MHm9O+gZWJ1X9uvQ0N6jCWLfV3L963My58Z9v3C4Tmos0tZUT4VUKZCk+vsD11tfS7QOG1M/8jQp1qDe3+L27Nv1VTZbpJM8cUrCJZny6JnyqW9emMHTN3plVoDpxA1epMrFbB+JsVW963cMGH5s5zg9SNAGGtRhWye74mbNFVVJKlAQR30dGVYFkZpr23adur6GKuuMbzeAfIpkIjTHfIHXOgWZTq5VPeFTHVgOqZW7dvQVFuV85lJJXAxjOqmMQic+ZKzVa237fAlzhpttI4OedsMT66zcyvPag1RjBFDDToSOw9tTbKxKtNxMyqp4mVhpXp5j++Ju7f3DUS1EcMMXc9ydBtpUcmTA5MLb7ebjR2V5vG5ceijGvqCoOtTxlJG4iazfEwvNQ7lmZW6k+uuhxsf3+ZKyL/wCX4mxt/jBFFXpTS+vbPrqkKiDJbWb4jk2ru2nu8agQq3MM9ADootA4mDUSNwK+0XaVu1tpUp4A78mVVe6sD3/qNR/UR2slLfAI1+0uekMLsd6PcHf7wJodnbttmxxYJK2nulvuEDSLQPTAtDKzZXkkyDn1+DD2Opf1OPbf3NdLD335H4l2vDurxyoIYfHjX4MV0tgvVj3CaSptFR9+pxzmGSF+YeobA7j2PbVoWV2psNwZCau1G/gmRumputXdopa62im8nKHZSOYZOMZ76JWiIulO4G1rC33LqFGz5UjEeSCxAznSeQNx/HYCHlLJBjB5RqewMpoAZpUNLGwchvxNnGemflobNrxDdPtJ5qEOMN1+es90/MyKV+J5DCafpGeX5a97pPvPeyvxJmqKjGDISNe9ZM9FSj2mbWuygnOvVE9biS2WrenkEiRu2OvQaHYN8SWp1Ku+eIxjomomQg+50zi4PVzF78oINRQT3SOWrknbs57av119I4kaywMdyjXXCmjnjmwMqdGG4E9MZXD7iHRUEaKzsrHoOmhkabcN1ArqaG7OKiJerfPITJSRyqJvXyHoT9O/01jMp+qxzX7+35n2Fb9Jkiz28H8R23G3Q3uyU60c6lWjDIwPlKkA9/bXA1s1b8id+jbXe4q9z8P93S1prIkR1jBwVqgfL7AHVvHzaQvSf8SflVW2HqBgte7RTPbx/imWdMkebBH5emmq7W6vskq8Aj7oHVtVDQECnwo/cC+g08ql/MU7nSeJcst1qaiZFBYjOSfYaxbWoEboyCYXW2++GWRz2YjvpSyjeiJQTJE2Ev0TL1Yfnpc0mMC4T4lvUXo39deCoz7vCVpL7H1HNrYpMybxKVZeo3Bw2iLSRBNeIz7RTRmhOIVzj31OffVAKRqKjiNZZZrkWamdVHrjIP5at4LBU8yRmKSfECamxOy4H06apq8nMkqSbUedRzt1+A1o2zwJP1LtSWnqEYSkAHQXyAPMMlBMv3Tbr1EHLzdjnXleSCeJ7ZTocwu21v7dVhstLZ6alNY1JGyxlQSxjUE9v5QPyGpuV6bTZYbCdb/zK2H6pYtYq6d6/wATy6cbLrURjFtVHAwGLkg/TQk9IRTyYZ/VyRoLF/dtz3S71Uk0z+H4jcxC9AfpqlXQlagASVZc9jEmVoQ8zhjlyTjHfvoh4ngEPdv22KkpORxmZxmQ+i/Aan22Fjx4lKqoKJm7nYUlZAUJUzKxHseXGf10erbp+ItexR/zMo3KdWwHOidAPtM99hPzXaYD8Z152xPfqTIXuczZy51oIJk3mVZbjL/Gda6RMG4zqixXakii5XjXHx1zFiMTK6kS7X1dknhLPBB9VGsJ3FPE0QpHMWG9ai2eIwgiiB/kAH6asYpf3Mm5Kp7QZhYOOi404XIioQGQVMUrdVGsHTTY2shPjr+IZHx1pVCzL7YTW2FMIN/WCWQhM18aA+5bp/zoeeerGcfpCYCdOQp/WD/GHbI23vaupoouWimkaelwOgRjkr/8nI+WPfX3p+R36QT5HB/39YfOo7Nh+D4gQY/NldPRMiFezbUsh+/T9UQ+Qe599K5FpA6RGqKt/cYYU0Bmc/uRg6RZtCOD4gBv+taov0DmnqEt8BNPTVCJlWlBHPg9j7Ear4dXTUd+TyfxImdd126HtK1Xaq+Es0LJVIP/AB5DY9+U9fyzrC2I08PUJnMZh3U6JqedUiZpvRWOvdGedUikaYLzNE2NfFSZnrnV1HbHkPLGmRrnGYCXwDLNTt6QxHJUEjtrAtAM0VJECr3tadJzIFBx6ao05CkaiF1JB3M6CjWLyPHg6YbnkQCkjzIrlNbaGIvU1Eafy5yx+mhje9QnTuClw3FFIWWjgCIP9x+4HvjRQhmgoEMeHG8opBZ9iNtSoo7rV3aGpqblPIQ0qRsZQojZQVXCqOhx+elM3H1W9/VsAa1+eIfEtZshK9aE2OPlK11pUkhpy8yPzjAyR0wf+/AaQ9JftMQxlb1CovWNCIV4mWQo4KkHBBGMa6QHY4nOHYOjC2wVTiJYlUgKMAY0pagPMZrfQ1NuuqKsUIit8Jnrqk+DSRKQOeVuw69sd8n20GusM/3eB5n11/bQkeYM26/Xo2MbMvVnFG1BIrlmQxtjJbDoRgsWwecEZx699PZK1qe4h8/7/okmnZOm9pOxB6+3XSA2I55EzLzcrXTN4ddzNMx/FEAWA92Hr+vz09jF2H6Ra0KJatVPRVEAqIXSaM9mU/8AcaYYEGDWRXKmgdeRFGvlM+adDUe4IIV5Qeo9tc09ZM6IMJZS6vUMSHCqfjoRTU35mVue90tuo2nrJQq9lHcsfYaPShY6Ew+tcxO7n3rUVUjpSKII846dWP11Vrq0OYmxUHiB8tTLO/NKxYn30cADxB9RM8rp2p6FpY1DPzLyg9icjprVahn0ZmxiqbELdtcRbhd9+7bvF2xHBaqhEEaMeQBmAdgD28vp8NK34KV0PWn80Yx8trblZh4nRm+rHMZmeFFdGycEfprlaLQOCZ0wPWvES/EbZEsNubcUZhpxEQKlGcDmHYOPcjsdXcLOBbtfPiSfUMP7e4P6xcvuigtcRVQauoHZYz5QfidVxjs5+BIRyFTxzKMt/wB10k1NuIMkaF3hhUKrKrEdVCnrnBxzD89GWmnRWKWWu52ZsU09ZUu9bcZDJVznnlJJOPZR8Bqfayk6XwPEPUNDZkl2qEgti/dqhTXysQsRXoqD94n59hrNKF35H2iGYDpGjz8QPFrkkkaSqnLMxycdSfqdVDYANKIt2D5Jlqhje3VHjUlRLGf3l6FWHsR6686yRzPuyISUNZDW+XmCS/wn1+WtKR4grEYciH9LVEMCWP56iMBLQM047o0YyH/roJr3Ch9RecRNwyV10aDxD4VOvIoz3Y9zp7HqCruL3W7MEkcszE6a8QAO59KT9c684nolbdDkWlgndGU/10XHA7kHkn/xyGiQLaoVBGWTJz6k9ev99euduZhNBBNH/OG+IqZbWd3X9KaJeVYfvDNyr7A98aGcXGY9fbXc2MvIQdIcgTLmkqZ2MlVJWVTd2epk5v1OihQvC6H4gHdm5Yk/kzQ2xtCuuFvqtyhYVt1JzEeJJyglepIz3A/XQMnOStxR/MZurCssQ2jwJe2FbKrcNxo455SYo+bwMr0RSSWkx7nWM/IWhCB/v6TOJQbrAsLd82eh27ArxXJnmmz4MDx+bA7sSD2Hy1Mwr3yTor48mUcvFTHGw3n2gFDI8jPKzczMereurhAA0JNQ72ZOGAXBx31iHHAkL9Tr3cyZCWKnIz8DrYmJ/9k=",
  },
]);

db.plans.insertMany([
  { id: "1m", label: "1 Month", price: "$99", details: "Monthly plan" },
  { id: "3m", label: "3 Months", price: "$150", details: "Quarterly plan" },
  { id: "12m", label: "12 Months", price: "$500", details: "Yearly plan" },
]);

// Seed classes collection
db.classes.insertMany([
  {
    name: "BJJ – Gi",
    description: `Traditional Brazilian Jiu-Jitsu focused on grips, leverage, and positional control using the kimono. Expect technique drilling, positional sparring, and rolling with emphasis on detail and discipline.`,
    teacherIds: [0, 1],
  },
  {
    name: "BJJ – No-Gi",
    description: `Submission grappling with a faster pace and no uniform grips. Ideal for developing body control, wrestling transitions, and fluid movement under pressure.`,
    teacherIds: [2, 3],
  },
  {
    name: "Yoga Flow",
    description: `A dynamic class combining balance, strength, and flexibility. Focuses on controlled breathing, mindful transitions, and postures that improve recovery and joint mobility.`,
    teacherIds: [4, 5],
  },
  {
    name: "Strength & Conditioning",
    description: `Functional training to enhance explosive power, stability, and endurance. Includes kettlebells, mobility drills, and core circuits tailored for combat athletes.`,
    teacherIds: [6, 7],
  },
]);

// Seed teachers collection
db.teachers.insertMany([
  {
    id: 0,
    firstName: "Rafael",
    lastName: "Santos",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity.",
  },
  {
    id: 1,
    firstName: "Marcus",
    lastName: "Johnson",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity.",
  },
  {
    id: 2,
    firstName: "Carlos",
    lastName: "Rodriguez",
    avatar: "https://randomuser.me/api/portraits/men/21.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity.",
  },
  {
    id: 3,
    firstName: "Elias",
    lastName: "Thompson",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity.",
  },
  {
    id: 4,
    firstName: "Maria",
    lastName: "Oliveira",
    avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity.",
  },
  {
    id: 5,
    firstName: "Sophie",
    lastName: "Laurent",
    avatar: "https://randomuser.me/api/portraits/women/66.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity.",
  },
  {
    id: 6,
    firstName: "Lena",
    lastName: "Mueller",
    avatar: "https://randomuser.me/api/portraits/men/77.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity.",
  },
  {
    id: 7,
    firstName: "Yuki",
    lastName: "Tanaka",
    avatar: "https://randomuser.me/api/portraits/men/88.jpg",
    bio: "An experienced coach dedicated to helping students grow in skill, discipline, and confidence. Focuses on technique, mindset, and steady progress.",
    quirkyFact: "Once taught a class on a moving train for charity.",
  },
]);
