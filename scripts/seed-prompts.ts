import { PrismaClient, PromptCategory } from '@prisma/client'

const prisma = new PrismaClient()

const PROMPTS = [
  // FAITH_AND_BELIEF (15 prompts)
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "A Bible verse that guides my daily life is...",
    order: 1
  },
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "My faith became real to me when...",
    order: 2
  },
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "I see God's hand in my life through...",
    order: 3
  },
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "The most important thing about my faith journey is...",
    order: 4
  },
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "Prayer means to me...",
    order: 5
  },
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "A spiritual practice I cherish is...",
    order: 6
  },
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "I grew in faith when...",
    order: 7
  },
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "My favorite way to worship is...",
    order: 8
  },
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "God taught me patience through...",
    order: 9
  },
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "The spiritual gift I value most is...",
    order: 10
  },
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "A moment when I felt God's presence was...",
    order: 11
  },
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "I express my faith by...",
    order: 12
  },
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "My testimony in one sentence...",
    order: 13
  },
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "A Christian book that changed my perspective...",
    order: 14
  },
  {
    category: 'FAITH_AND_BELIEF' as PromptCategory,
    text: "What I'm learning about God right now...",
    order: 15
  },

  // PERSONALITY_AND_DAILY_LIFE (12 prompts)
  {
    category: 'PERSONALITY_AND_DAILY_LIFE' as PromptCategory,
    text: "My perfect Sunday looks like...",
    order: 16
  },
  {
    category: 'PERSONALITY_AND_DAILY_LIFE' as PromptCategory,
    text: "I'm the type of person who...",
    order: 17
  },
  {
    category: 'PERSONALITY_AND_DAILY_LIFE' as PromptCategory,
    text: "A typical weekend for me involves...",
    order: 18
  },
  {
    category: 'PERSONALITY_AND_DAILY_LIFE' as PromptCategory,
    text: "I'm happiest when...",
    order: 19
  },
  {
    category: 'PERSONALITY_AND_DAILY_LIFE' as PromptCategory,
    text: "My friends would describe me as...",
    order: 20
  },
  {
    category: 'PERSONALITY_AND_DAILY_LIFE' as PromptCategory,
    text: "An unusual skill I have is...",
    order: 21
  },
  {
    category: 'PERSONALITY_AND_DAILY_LIFE' as PromptCategory,
    text: "My morning routine includes...",
    order: 22
  },
  {
    category: 'PERSONALITY_AND_DAILY_LIFE' as PromptCategory,
    text: "I unwind by...",
    order: 23
  },
  {
    category: 'PERSONALITY_AND_DAILY_LIFE' as PromptCategory,
    text: "My biggest pet peeve is...",
    order: 24
  },
  {
    category: 'PERSONALITY_AND_DAILY_LIFE' as PromptCategory,
    text: "I can't live without...",
    order: 25
  },
  {
    category: 'PERSONALITY_AND_DAILY_LIFE' as PromptCategory,
    text: "The best way to get to know me is...",
    order: 26
  },
  {
    category: 'PERSONALITY_AND_DAILY_LIFE' as PromptCategory,
    text: "A random fact about me...",
    order: 27
  },

  // RELATIONSHIP_AND_MARRIAGE (12 prompts)
  {
    category: 'RELATIONSHIP_AND_MARRIAGE' as PromptCategory,
    text: "In a relationship, I value...",
    order: 28
  },
  {
    category: 'RELATIONSHIP_AND_MARRIAGE' as PromptCategory,
    text: "My ideal date night would be...",
    order: 29
  },
  {
    category: 'RELATIONSHIP_AND_MARRIAGE' as PromptCategory,
    text: "A Christ-centered marriage means...",
    order: 30
  },
  {
    category: 'RELATIONSHIP_AND_MARRIAGE' as PromptCategory,
    text: "I show love by...",
    order: 31
  },
  {
    category: 'RELATIONSHIP_AND_MARRIAGE' as PromptCategory,
    text: "For our future family, I hope...",
    order: 32
  },
  {
    category: 'RELATIONSHIP_AND_MARRIAGE' as PromptCategory,
    text: "My love language is...",
    order: 33
  },
  {
    category: 'RELATIONSHIP_AND_MARRIAGE' as PromptCategory,
    text: "In a partner, I'm looking for...",
    order: 34
  },
  {
    category: 'RELATIONSHIP_AND_MARRIAGE' as PromptCategory,
    text: "Together, we could...",
    order: 35
  },
  {
    category: 'RELATIONSHIP_AND_MARRIAGE' as PromptCategory,
    text: "I believe marriage is...",
    order: 36
  },
  {
    category: 'RELATIONSHIP_AND_MARRIAGE' as PromptCategory,
    text: "A relationship deal-breaker for me is...",
    order: 37
  },
  {
    category: 'RELATIONSHIP_AND_MARRIAGE' as PromptCategory,
    text: "The key to a lasting relationship is...",
    order: 38
  },
  {
    category: 'RELATIONSHIP_AND_MARRIAGE' as PromptCategory,
    text: "I'm ready for marriage because...",
    order: 39
  },

  // LIFESTYLE_AND_MISSION (8 prompts)
  {
    category: 'LIFESTYLE_AND_MISSION' as PromptCategory,
    text: "My calling in life is...",
    order: 40
  },
  {
    category: 'LIFESTYLE_AND_MISSION' as PromptCategory,
    text: "I serve my community by...",
    order: 41
  },
  {
    category: 'LIFESTYLE_AND_MISSION' as PromptCategory,
    text: "A cause I'm passionate about...",
    order: 42
  },
  {
    category: 'LIFESTYLE_AND_MISSION' as PromptCategory,
    text: "My dream mission trip would be...",
    order: 43
  },
  {
    category: 'LIFESTYLE_AND_MISSION' as PromptCategory,
    text: "In 5 years, I see myself...",
    order: 44
  },
  {
    category: 'LIFESTYLE_AND_MISSION' as PromptCategory,
    text: "I want to make a difference by...",
    order: 45
  },
  {
    category: 'LIFESTYLE_AND_MISSION' as PromptCategory,
    text: "My ministry involvement includes...",
    order: 46
  },
  {
    category: 'LIFESTYLE_AND_MISSION' as PromptCategory,
    text: "God is calling me to...",
    order: 47
  },

  // CREATIVITY_AND_FUN (8 prompts)
  {
    category: 'CREATIVITY_AND_FUN' as PromptCategory,
    text: "My hidden talent is...",
    order: 48
  },
  {
    category: 'CREATIVITY_AND_FUN' as PromptCategory,
    text: "A hobby I'm passionate about...",
    order: 49
  },
  {
    category: 'CREATIVITY_AND_FUN' as PromptCategory,
    text: "The best trip I've taken was...",
    order: 50
  },
  {
    category: 'CREATIVITY_AND_FUN' as PromptCategory,
    text: "If I could learn any skill instantly...",
    order: 51
  },
  {
    category: 'CREATIVITY_AND_FUN' as PromptCategory,
    text: "My go-to karaoke song is...",
    order: 52
  },
  {
    category: 'CREATIVITY_AND_FUN' as PromptCategory,
    text: "I'm weirdly good at...",
    order: 53
  },
  {
    category: 'CREATIVITY_AND_FUN' as PromptCategory,
    text: "My bucket list includes...",
    order: 54
  },
  {
    category: 'CREATIVITY_AND_FUN' as PromptCategory,
    text: "The most adventurous thing I've done...",
    order: 55
  },
]

async function main() {
  console.log('🌱 Seeding prompts...')

  // Clear existing prompts
  await prisma.promptAnswer.deleteMany({})
  await prisma.prompt.deleteMany({})

  // Create all prompts
  for (const prompt of PROMPTS) {
    await prisma.prompt.create({
      data: prompt
    })
  }

  console.log(`✅ Created ${PROMPTS.length} prompts across 5 categories`)
  console.log('   - FAITH_AND_BELIEF: 15 prompts')
  console.log('   - PERSONALITY_AND_DAILY_LIFE: 12 prompts')
  console.log('   - RELATIONSHIP_AND_MARRIAGE: 12 prompts')
  console.log('   - LIFESTYLE_AND_MISSION: 8 prompts')
  console.log('   - CREATIVITY_AND_FUN: 8 prompts')
}

main()
  .catch((e) => {
    console.error('Error seeding prompts:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
