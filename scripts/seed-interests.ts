import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const INTERESTS = [
  // Faith & Spirituality (8)
  { name: 'Bible Study', emoji: '📖', category: 'Faith & Spirituality', order: 1 },
  { name: 'Prayer', emoji: '🙏', category: 'Faith & Spirituality', order: 2 },
  { name: 'Worship', emoji: '🎵', category: 'Faith & Spirituality', order: 3 },
  { name: 'Ministry', emoji: '✝️', category: 'Faith & Spirituality', order: 4 },
  { name: 'Missions', emoji: '🌍', category: 'Faith & Spirituality', order: 5 },
  { name: 'Evangelism', emoji: '📢', category: 'Faith & Spirituality', order: 6 },
  { name: 'Discipleship', emoji: '👥', category: 'Faith & Spirituality', order: 7 },
  { name: 'Theology', emoji: '📚', category: 'Faith & Spirituality', order: 8 },

  // Arts & Creativity (7)
  { name: 'Music', emoji: '🎼', category: 'Arts & Creativity', order: 9 },
  { name: 'Singing', emoji: '🎤', category: 'Arts & Creativity', order: 10 },
  { name: 'Photography', emoji: '📷', category: 'Arts & Creativity', order: 11 },
  { name: 'Art & Painting', emoji: '🎨', category: 'Arts & Creativity', order: 12 },
  { name: 'Writing', emoji: '✍️', category: 'Arts & Creativity', order: 13 },
  { name: 'Dancing', emoji: '💃', category: 'Arts & Creativity', order: 14 },
  { name: 'Crafts', emoji: '🧶', category: 'Arts & Creativity', order: 15 },

  // Sports & Fitness (8)
  { name: 'Gym & Fitness', emoji: '💪', category: 'Sports & Fitness', order: 16 },
  { name: 'Running', emoji: '🏃', category: 'Sports & Fitness', order: 17 },
  { name: 'Yoga', emoji: '🧘', category: 'Sports & Fitness', order: 18 },
  { name: 'Swimming', emoji: '🏊', category: 'Sports & Fitness', order: 19 },
  { name: 'Cycling', emoji: '🚴', category: 'Sports & Fitness', order: 20 },
  { name: 'Cricket', emoji: '🏏', category: 'Sports & Fitness', order: 21 },
  { name: 'Football', emoji: '⚽', category: 'Sports & Fitness', order: 22 },
  { name: 'Hiking', emoji: '🥾', category: 'Sports & Fitness', order: 23 },

  // Food & Cooking (5)
  { name: 'Cooking', emoji: '👨‍🍳', category: 'Food & Cooking', order: 24 },
  { name: 'Baking', emoji: '🧁', category: 'Food & Cooking', order: 25 },
  { name: 'Food Blogging', emoji: '📸', category: 'Food & Cooking', order: 26 },
  { name: 'Trying New Cuisines', emoji: '🍽️', category: 'Food & Cooking', order: 27 },
  { name: 'Coffee', emoji: '☕', category: 'Food & Cooking', order: 28 },

  // Travel & Adventure (6)
  { name: 'Traveling', emoji: '✈️', category: 'Travel & Adventure', order: 29 },
  { name: 'Road Trips', emoji: '🚗', category: 'Travel & Adventure', order: 30 },
  { name: 'Camping', emoji: '⛺', category: 'Travel & Adventure', order: 31 },
  { name: 'Beach', emoji: '🏖️', category: 'Travel & Adventure', order: 32 },
  { name: 'Mountains', emoji: '⛰️', category: 'Travel & Adventure', order: 33 },
  { name: 'Adventure Sports', emoji: '🪂', category: 'Travel & Adventure', order: 34 },

  // Learning & Development (6)
  { name: 'Reading', emoji: '📚', category: 'Learning & Development', order: 35 },
  { name: 'Podcasts', emoji: '🎧', category: 'Learning & Development', order: 36 },
  { name: 'Learning Languages', emoji: '🗣️', category: 'Learning & Development', order: 37 },
  { name: 'Online Courses', emoji: '💻', category: 'Learning & Development', order: 38 },
  { name: 'Personal Growth', emoji: '🌱', category: 'Learning & Development', order: 39 },
  { name: 'Public Speaking', emoji: '🎙️', category: 'Learning & Development', order: 40 },

  // Entertainment (6)
  { name: 'Movies', emoji: '🎬', category: 'Entertainment', order: 41 },
  { name: 'Netflix & Series', emoji: '📺', category: 'Entertainment', order: 42 },
  { name: 'Theater', emoji: '🎭', category: 'Entertainment', order: 43 },
  { name: 'Gaming', emoji: '🎮', category: 'Entertainment', order: 44 },
  { name: 'Board Games', emoji: '🎲', category: 'Entertainment', order: 45 },
  { name: 'Comedy Shows', emoji: '😂', category: 'Entertainment', order: 46 },

  // Social & Community (5)
  { name: 'Volunteering', emoji: '🤝', category: 'Social & Community', order: 47 },
  { name: 'Social Work', emoji: '❤️', category: 'Social & Community', order: 48 },
  { name: 'Mentoring', emoji: '👨‍🏫', category: 'Social & Community', order: 49 },
  { name: 'Community Events', emoji: '🎉', category: 'Social & Community', order: 50 },
  { name: 'Networking', emoji: '🤝', category: 'Social & Community', order: 51 },

  // Nature & Outdoors (4)
  { name: 'Gardening', emoji: '🌱', category: 'Nature & Outdoors', order: 52 },
  { name: 'Nature Walks', emoji: '🌳', category: 'Nature & Outdoors', order: 53 },
  { name: 'Bird Watching', emoji: '🦅', category: 'Nature & Outdoors', order: 54 },
  { name: 'Animals & Pets', emoji: '🐶', category: 'Nature & Outdoors', order: 55 },
]

async function main() {
  console.log('🌱 Seeding interests...')

  // Clear existing interests
  await prisma.userInterest.deleteMany({})
  await prisma.interestOption.deleteMany({})

  // Create all interests
  for (const interest of INTERESTS) {
    await prisma.interestOption.create({
      data: interest
    })
  }

  console.log(`✅ Created ${INTERESTS.length} interests across 9 categories`)
  console.log('   - Faith & Spirituality: 8 interests')
  console.log('   - Arts & Creativity: 7 interests')
  console.log('   - Sports & Fitness: 8 interests')
  console.log('   - Food & Cooking: 5 interests')
  console.log('   - Travel & Adventure: 6 interests')
  console.log('   - Learning & Development: 6 interests')
  console.log('   - Entertainment: 6 interests')
  console.log('   - Social & Community: 5 interests')
  console.log('   - Nature & Outdoors: 4 interests')
}

main()
  .catch((e) => {
    console.error('Error seeding interests:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
