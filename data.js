// All profiles and plans are fictional examples for this student prototype.
const LISTINGS = [
  { id: 1, name: "Sofia", initials: "SO", location: "Barcelona, Spain", knows: ["Spanish", "Catalan"], practices: ["English"], note: "Big fan of slow mornings, good books, and learning new expressions.", color: "coral", level: "Intermediate" },
  { id: 2, name: "Aiko", initials: "AK", location: "Osaka, Japan", knows: ["Japanese"], practices: ["English", "Spanish"], note: "I love cooking and can teach you the names of all my favorite dishes.", color: "lilac", level: "Beginner" },
  { id: 3, name: "Lukas", initials: "LU", location: "Berlin, Germany", knows: ["German"], practices: ["Spanish", "English"], note: "Here for relaxed chats about music, travel, and everyday life.", color: "mint", level: "Intermediate" },
  { id: 4, name: "Camille", initials: "CA", location: "Lyon, France", knows: ["French"], practices: ["English", "Italian"], note: "Let's trade stories and help each other feel at home in a new language.", color: "yellow", level: "Advanced" },
  { id: 5, name: "Rafa", initials: "RA", location: "Lisbon, Portugal", knows: ["Portuguese"], practices: ["Spanish", "English"], note: "Friendly conversations, football, and finding the best local cafés.", color: "blue", level: "Beginner" },
  { id: 6, name: "Giulia", initials: "GI", location: "Bologna, Italy", knows: ["Italian"], practices: ["English", "French"], note: "I enjoy talking about art, food, and the little things in life.", color: "pink", level: "Intermediate" },
  { id: 7, name: "Elena", initials: "EL", location: "Mexico City, Mexico", knows: ["Spanish"], practices: ["French", "English"], note: "Curious about the world and always happy to share a new word.", color: "orange", level: "Intermediate" },
  { id: 8, name: "Kenji", initials: "KE", location: "Kyoto, Japan", knows: ["Japanese"], practices: ["Spanish", "English"], note: "Let's practice over a relaxed chat about films and weekend plans.", color: "green", level: "Beginner" }
];

const PLANS = [
  { name: "Hello", price: 5, description: "A little language practice to get you going.", features: ["Find a conversation partner", "2 video calls each month", "Core language matching"] },
  { name: "Chat", price: 10, description: "Make room for a few more good conversations.", features: ["Everything in Hello", "5 video calls each month", "Save favorite partners"], popular: true },
  { name: "Fluent", price: 20, description: "Build a steady rhythm and keep your progress moving.", features: ["Everything in Chat", "12 video calls each month", "Personalized partner suggestions"] },
  { name: "Together", price: 40, description: "For learners ready to make every week count.", features: ["Everything in Fluent", "Unlimited video calls", "Priority partner matching"] }
];
