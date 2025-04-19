export const galleryData = [
  {
    id: 1,
    title: "Annual Diwali Celebration",
    description: "Photos from our annual Diwali celebration event with community members.",
    category: "Events",
    subCategory: "Festivals",
    tags: ["diwali", "celebration", "community"],
    date: "2023-11-12",
    media: [
      {
        url: "/festival-of-lights.png",
        type: "image",
      },
      {
        url: "/vibrant-global-celebration.png",
        type: "image",
      },
    ],
  },
  {
    id: 2,
    title: "Community Outreach Program",
    description: "Our volunteers participating in the community garden planting initiative.",
    category: "Community",
    subCategory: "Outreach",
    tags: ["volunteer", "garden", "outreach"],
    date: "2023-10-15",
    media: [
      {
        url: "/helping-hands-garden.png",
        type: "image",
      },
    ],
  },
  {
    id: 3,
    title: "Cultural Dance Performance",
    description: "Traditional dance performances by our talented community members.",
    category: "Events",
    subCategory: "Cultural",
    tags: ["dance", "performance", "cultural"],
    date: "2023-09-28",
    media: [
      {
        url: "/expressive-contemporary-dance.png",
        type: "image",
      },
    ],
  },
  {
    id: 4,
    title: "New Gym Equipment Showcase",
    description: "Showcasing our newly acquired gym equipment for community use.",
    category: "Facilities",
    subCategory: "Gym",
    tags: ["gym", "equipment", "fitness"],
    date: "2023-08-05",
    media: [
      {
        url: "/vibrant-urban-gym.png",
        type: "image",
      },
      {
        url: "/modern-gym-floor.png",
        type: "image",
      },
    ],
  },
  {
    id: 5,
    title: "Committee Meeting Highlights",
    description: "Key moments from our recent committee meeting discussing upcoming initiatives.",
    category: "Members",
    subCategory: "Committee",
    tags: ["meeting", "committee", "planning"],
    date: "2023-07-22",
    media: [
      {
        url: "/virtual-meeting-diversity.png",
        type: "image",
      },
    ],
  },
]

export const galleryCategories = [
  { id: "1", name: "Events" },
  { id: "2", name: "Community" },
  { id: "3", name: "Facilities" },
  { id: "4", name: "Members" },
  { id: "5", name: "Celebrations" },
]

export const gallerySubCategories = {
  events: [
    { id: "1", name: "Annual Function" },
    { id: "2", name: "Festivals" },
    { id: "3", name: "Workshops" },
    { id: "4", name: "Cultural" },
  ],
  community: [
    { id: "5", name: "Gatherings" },
    { id: "6", name: "Outreach" },
  ],
  facilities: [
    { id: "7", name: "Gym" },
    { id: "8", name: "Library" },
    { id: "9", name: "Party Plots" },
  ],
  members: [
    { id: "10", name: "Committee" },
    { id: "11", name: "Trustees" },
    { id: "12", name: "General Members" },
  ],
  celebrations: [
    { id: "13", name: "Diwali" },
    { id: "14", name: "Navratri" },
    { id: "15", name: "Holi" },
  ],
}

export const gallerySettings = {
  publicGallery: true,
  requireApproval: true,
  allowComments: true,
  allowRating: false,
  maxFileSize: 10,
  maxFilesPerUpload: 5,
  defaultCategory: "events",
  allowedFileTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4"],
  sortOrder: "newest",
  itemsPerPage: 12,
  displayMetadata: true,
  featuredGalleryItems: [1, 3, 4],
}
