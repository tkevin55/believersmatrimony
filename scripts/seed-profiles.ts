// @ts-nocheck
/**
 * Kaapi Connect Profile Seed Script
 * Generates realistic Malayalam/Kerala profiles with Kaapi Connect attributes
 *
 * Run with: npm run seed:profiles
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Kerala-focused cities and locations
const KERALA_CITIES = [
  'Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kannur',
  'Kollam', 'Palakkad', 'Alappuzha', 'Kottayam', 'Malappuram'
]

const KERALA_DISTRICTS = [
  'THIRUVANANTHAPURAM', 'KOLLAM', 'PATHANAMTHITTA', 'ALAPPUZHA',
  'KOTTAYAM', 'IDUKKI', 'ERNAKULAM', 'THRISSUR', 'PALAKKAD',
  'MALAPPURAM', 'KOZHIKODE', 'WAYANAD', 'KANNUR', 'KASARAGOD'
]

const DIASPORA_LOCATIONS = [
  'Dubai', 'Abu Dhabi', 'Muscat', 'Doha', 'Kuwait City',
  'Singapore', 'London', 'Toronto', 'Melbourne', 'New York',
  'San Francisco', 'Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad'
]

// Malayalam/Kerala names
const MALE_FIRST_NAMES = [
  'Adwaith', 'Nibin', 'Athul', 'Kiran', 'Midhun', 'Pranav', 'Rohit', 'Amal',
  'Akhil', 'Aswin', 'Anand', 'Vishnu', 'Arun', 'Vivek', 'Hari', 'Krishna',
  'Sujith', 'Suresh', 'Jayesh', 'Jithin', 'Sreekanth', 'Sreejith', 'Unni',
  'Vinay', 'Vinod', 'Rahul', 'Raj', 'Ravi', 'Anoop', 'Arjun'
]

const FEMALE_FIRST_NAMES = [
  'Anjana', 'Sruthi', 'Malu', 'Nithya', 'Sreya', 'Gayathri', 'Anju', 'Dhanya',
  'Kavya', 'Keerthi', 'Lakshmi', 'Meera', 'Neha', 'Priya', 'Reshma', 'Riya',
  'Sneha', 'Suja', 'Swathi', 'Uma', 'Vani', 'Vidya', 'Lekshmi', 'Aparna',
  'Archana', 'Deepa', 'Divya', 'Jyothi', 'Revathi', 'Shilpa'
]

const LAST_NAMES = [
  'Menon', 'Nair', 'Pillai', 'Kumar', 'Krishnan', 'Unni', 'Namboothiri',
  'Varma', 'Panicker', 'Warrier', 'Kartha', 'Kutty', 'Rajan', 'Raj',
  'Chandran', 'Nambiar', 'Thampi', 'Karunakaran', 'Das', 'Menon'
]

// Kaapi Connect Interest Tags
const INTEREST_TAGS = [
  'Music', 'Movies', 'Reading', 'Cooking', 'Travel', 'Photography',
  'Sports', 'Fitness', 'Yoga', 'Art', 'Gaming', 'Dancing', 'Hiking',
  'Cycling', 'Writing', 'Volunteering', 'Gardening', 'Technology',
  'Malayalam Cinema', 'Indie Music', 'Coffee Culture', 'Kathakali',
  'Theyyam', 'Kerala Food', 'Backwaters', 'Beaches', 'Trekking',
  'Wildlife Photography', 'Book Clubs', 'Poetry', 'Painting'
]

// Social Values
const SOCIAL_VALUES = [
  'Environmentalism', 'Social Justice', 'Gender Equality', 'Animal Welfare',
  'Education Access', 'Community Service', 'Mental Health Advocacy',
  'Sustainable Living', 'Arts & Culture', 'Local Business Support'
]

// Political Leanings
const POLITICAL_LEANINGS = [
  'PROGRESSIVE', 'LIBERAL', 'MODERATE', 'CONSERVATIVE',
  'APOLITICAL', 'PREFER_NOT_TO_SAY'
]

// Kerala Connection descriptions
const KERALA_CONNECTIONS = [
  'Born and raised in Kerala',
  'Kerala roots, grew up in diaspora',
  'Family from Kerala, visit annually',
  'Recently moved to Kerala',
  'Kerala heritage, exploring my roots',
  'Grew up in Kerala, now working abroad'
]

// Occupations (Kerala-focused)
const OCCUPATIONS = [
  'Software Engineer', 'Nurse', 'Designer', 'Film Professional', 'Teacher',
  'Doctor', 'Entrepreneur', 'Chef', 'Photographer', 'Marketing Manager',
  'HR Manager', 'Accountant', 'Architect', 'Civil Engineer', 'Banker',
  'Journalist', 'Lawyer', 'Pharmacist', 'Data Scientist', 'Product Manager',
  'Hospitality Manager', 'Travel Consultant', 'Social Worker', 'Content Creator'
]

const COMPANIES = [
  'TCS', 'Infosys', 'UST', 'Ernst & Young', 'Accenture', 'Wipro',
  'Cognizant', 'Federal Bank', 'Google', 'Microsoft', 'Amazon',
  'Flipkart', 'Lulu Group', 'Emirates', 'Etihad', 'Marriott',
  'Apollo Hospitals', 'Aster DM Healthcare', 'Self-employed', 'Startup'
]

const FIELDS_OF_STUDY = [
  'Computer Science', 'Engineering', 'Medicine', 'Nursing', 'Commerce',
  'Business Administration', 'Arts', 'Design', 'Film Studies', 'Law',
  'Architecture', 'Pharmacy', 'Psychology', 'Economics', 'Mass Communication'
]

// Realistic about me bios
const BIO_TEMPLATES = [
  (name, interests) => `Hey! I'm ${name}, and I'm all about ${interests[0].toLowerCase()}, ${interests[1].toLowerCase()}, and discovering new coffee spots around town. Looking for someone who's up for spontaneous road trips and deep conversations over chai.`,

  (name, interests) => `${name} here! Work keeps me busy, but I make time for what matters - ${interests[0].toLowerCase()}, ${interests[1].toLowerCase()}, and good company. Seeking someone genuine who appreciates both quiet evenings and random adventures.`,

  (name, interests) => `I'm ${name}, a ${interests[0].toLowerCase()} enthusiast who believes life's too short for boring weekends. Also into ${interests[1].toLowerCase()} and ${interests[2].toLowerCase()}. Looking for my partner-in-crime for life's next chapter!`,

  (name, interests) => `Call me ${name}! I love ${interests[0].toLowerCase()}, ${interests[1].toLowerCase()}, and trying new Kerala food spots. Hoping to find someone who gets my random humor and shares my love for good conversations.`,

  (name, interests) => `${name} here - equal parts ${interests[0].toLowerCase()} nerd and ${interests[1].toLowerCase()} fanatic. Recently got into ${interests[2].toLowerCase()} too. Looking for someone who's kind, ambitious, and doesn't mind my playlist on road trips.`,

  (name, interests) => `Hey, I'm ${name}! Weekdays I'm focused on work, weekends you'll find me ${interests[0].toLowerCase()} or ${interests[1].toLowerCase()}. Searching for someone who values family, has their own passions, and is ready to build something meaningful.`
]

// Helper functions
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateDOB(minAge: number, maxAge: number): Date {
  const age = randomNumber(minAge, maxAge)
  const today = new Date()
  const birthYear = today.getFullYear() - age
  const month = randomNumber(0, 11)
  const day = randomNumber(1, 28)
  return new Date(birthYear, month, day)
}

function generatePhoneNumber(): string {
  return `+91${randomNumber(6000000000, 9999999999)}`
}

function generatePlaceholderImage(): string {
  // Returns a 1x1 pixel PNG - in production, use real profile images
  return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`
}

async function main() {
  console.log('🌱 Starting Kaapi Connect profile seeding...')
  console.log('   Creating 100 realistic Kerala/Malayalam profiles\n')

  const educationLevels = ['HIGH_SCHOOL', 'ASSOCIATE', 'BACHELORS', 'MASTERS', 'DOCTORATE', 'TRADE_SCHOOL']
  const bodyTypes = ['SLIM', 'AVERAGE', 'ATHLETIC', 'CURVY', 'PLUS_SIZE']
  const familyTypes = ['NUCLEAR', 'JOINT']
  const incomeRanges = ['BELOW_5L', 'L5_TO_10L', 'L10_TO_20L', 'L20_TO_30L', 'ABOVE_30L']

  const hashedPassword = await bcrypt.hash('Password123!', 10)

  // Track created emails to avoid duplicates
  const createdEmails = new Set()

  for (let i = 0; i < 100; i++) {
    const gender: string = i % 2 === 0 ? 'MALE' : 'FEMALE'
    const firstName = gender === 'MALE'
      ? randomElement(MALE_FIRST_NAMES)
      : randomElement(FEMALE_FIRST_NAMES)
    const lastName = randomElement(LAST_NAMES)
    const fullName = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`

    // Skip if email already exists (idempotency check)
    if (createdEmails.has(email)) {
      console.log(`⏭️  Skipping ${email} (already exists)`)
      continue
    }

    const phoneNumber = generatePhoneNumber()
    const dob = generateDOB(23, 34) // Kaapi Connect age range
    const isInDiaspora = Math.random() > 0.7 // 30% in diaspora
    const city = isInDiaspora ? randomElement(DIASPORA_LOCATIONS) : randomElement(KERALA_CITIES)
    const state = isInDiaspora ? randomElement(['UAE', 'UK', 'USA', 'Australia', 'Singapore', 'Karnataka', 'Maharashtra']) : 'Kerala'
    const country = isInDiaspora && !['Karnataka', 'Maharashtra'].includes(state)
      ? state === 'UAE' ? 'UAE'
      : state === 'UK' ? 'United Kingdom'
      : state === 'USA' ? 'United States'
      : state === 'Australia' ? 'Australia'
      : 'Singapore'
      : 'India'

    const height = gender === 'MALE' ? randomNumber(165, 185) : randomNumber(152, 172)
    const selectedInterests = randomElements(INTEREST_TAGS, randomNumber(8, 12))
    const selectedSocialValues = randomElements(SOCIAL_VALUES, randomNumber(2, 4))
    const politicalLeaning = randomElement(POLITICAL_LEANINGS)
    const homeDistrict = randomElement(KERALA_DISTRICTS)
    const keralaConnection = randomElement(KERALA_CONNECTIONS)
    const bioTemplate = randomElement(BIO_TEMPLATES)
    const aboutMe = bioTemplate(firstName, selectedInterests)

    try {
      console.log(`Creating ${i + 1}/100: ${fullName} (${city})`)

      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email }
      })

      if (existing) {
        console.log(`✓ Already exists: ${fullName}`)
        createdEmails.add(email)
        continue
      }

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: fullName,
          phoneNumber,
          phoneVerified: true,
          emailVerified: new Date(),
          onboardingCompleted: true,
          profile: {
            create: {
              dateOfBirth: dob,
              gender,
              city,
              state,
              country,
              openToRelocate: Math.random() > 0.5,
              height,
              bodyType: randomElement(bodyTypes),
              complexion: randomElement(['Fair', 'Wheatish', 'Dusky', 'Dark']),
              languages: ['English', 'Malayalam', randomElement(['Hindi', 'Tamil', 'Kannada'])],
              educationLevel: randomElement(educationLevels),
              fieldOfStudy: randomElement(FIELDS_OF_STUDY),
              occupation: randomElement(OCCUPATIONS),
              company: randomElement(COMPANIES),
              incomeRange: randomElement(incomeRanges),
              parentsOccupation: `Father: ${randomElement(['Retired', 'Business', 'Government Service', 'Private Sector'])}, Mother: ${randomElement(['Homemaker', 'Teacher', 'Nurse', 'Business', 'Retired'])}`,
              siblingsCount: randomNumber(0, 3),
              birthOrder: randomElement(['Only child', 'Eldest', 'Middle', 'Youngest']),
              familyType: randomElement(familyTypes),
              familyValues: randomElement(['Traditional', 'Moderate', 'Progressive', 'Liberal']),
              drinking: randomElement(['Never', 'Occasionally', 'Socially']),
              smoking: randomElement(['Never', 'Occasionally']),
              dietPreference: randomElement(['Vegetarian', 'Eggetarian', 'Non-vegetarian', 'Pescatarian']),
              hobbies: selectedInterests.join(', '),
              aboutMe,
              completionPercentage: 100,

              // Kaapi Connect specific fields
              interestTags: selectedInterests,
              socialValues: selectedSocialValues,
              politicalLeaning,
              homeDistrict,
              diasporaLocation: isInDiaspora ? city : null,
              keralaConnection,
              weekendPreference: randomElement(['RELAXED', 'ACTIVE', 'SOCIAL', 'FLEXIBLE']),
              communicationStyle: randomElement(['FREQUENT', 'MODERATE', 'INDEPENDENT'])
            }
          },
          partnerPreferences: {
            create: {
              ageMin: Math.max(23, dob.getFullYear() - new Date().getFullYear() - 5),
              ageMax: Math.min(38, dob.getFullYear() - new Date().getFullYear() + 8),
              heightMin: gender === 'MALE' ? 152 : 165,
              heightMax: gender === 'MALE' ? 172 : 185,
              educationLevels: randomElements(educationLevels, randomNumber(2, 3)),
              locations: [city, ...randomElements([...KERALA_CITIES, ...DIASPORA_LOCATIONS].filter(c => c !== city), 2)],
              incomeRange: randomElement(incomeRanges),
              preferredInterests: randomElements(INTEREST_TAGS, randomNumber(5, 8)),
              preferredPoliticalLeanings: randomElements(POLITICAL_LEANINGS, randomNumber(2, 4)),
              preferredKeralaDistricts: randomElements(KERALA_DISTRICTS, randomNumber(3, 6)),
              okayWithDiaspora: randomElement(['yes', 'no', 'either'])
            }
          },
          photos: {
            create: [
              {
                url: generatePlaceholderImage(),
                order: 0,
                isPrimary: true,
              }
            ]
          }
        }
      })

      createdEmails.add(email)
      console.log(`✅ Created: ${fullName} (${gender}) - ${city}, ${country}`)
    } catch (error) {
      console.error(`❌ Error creating profile ${i + 1}:`, error.message)
      // Continue with next profile
    }
  }

  console.log('\n✅ Seeding completed!')
  console.log(`📊 Total profiles created: ${createdEmails.size}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
