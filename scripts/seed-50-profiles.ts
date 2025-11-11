// @ts-nocheck
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Indian cities
const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Coimbatore', 'Kochi', 'Chandigarh'
]

const STATES = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat',
  'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh', 'Kerala', 'Punjab'
]

const FIRST_NAMES_MALE = [
  'John', 'David', 'Michael', 'Samuel', 'Daniel', 'Joseph', 'Thomas', 'James', 'Paul', 'Peter',
  'Matthew', 'Mark', 'Luke', 'Andrew', 'Philip', 'Stephen', 'Timothy', 'Benjamin', 'Joshua', 'Caleb'
]

const FIRST_NAMES_FEMALE = [
  'Sarah', 'Mary', 'Ruth', 'Esther', 'Rachel', 'Hannah', 'Elizabeth', 'Grace', 'Faith', 'Hope',
  'Joy', 'Priya', 'Rebecca', 'Anna', 'Martha', 'Deborah', 'Lydia', 'Naomi', 'Leah', 'Abigail'
]

const LAST_NAMES = [
  'Kumar', 'Sharma', 'Singh', 'Patel', 'Reddy', 'Nair', 'Thomas', 'Joseph', 'Samuel', 'David',
  'Paul', 'George', 'Abraham', 'John', 'Peter', 'Philip', 'Matthew', 'Stephen', 'Daniel', 'Joshua'
]

const CHURCHES = [
  'Grace Community Church', 'Faith Assembly', 'Bethel Church', 'New Life Fellowship',
  'Victory Church', 'Emmanuel Baptist Church', 'Calvary Chapel', 'Cornerstone Church',
  'Living Waters Church', 'Hope Church', 'Redeemer Church', 'Trinity Church'
]

const OCCUPATIONS = [
  'Software Engineer', 'Doctor', 'Teacher', 'Business Analyst', 'Accountant', 'Nurse',
  'Civil Engineer', 'Architect', 'Designer', 'Marketing Manager', 'Sales Executive',
  'Data Scientist', 'Product Manager', 'HR Manager', 'Financial Analyst', 'Consultant'
]

const FIELDS_OF_STUDY = [
  'Computer Science', 'Medicine', 'Engineering', 'Business Administration', 'Commerce',
  'Biology', 'Nursing', 'Architecture', 'Design', 'Marketing', 'Finance', 'Law'
]

const HOBBIES = [
  'Reading, Music, Prayer groups', 'Traveling, Photography, Bible study', 'Cooking, Singing, Ministry work',
  'Sports, Fitness, Volunteering', 'Art, Writing, Music', 'Dancing, Hiking, Reading',
  'Swimming, Cycling, Photography', 'Gardening, Cooking, Singing'
]

const TESTIMONIES = [
  'I accepted Christ as my Savior at a young age and have been growing in faith ever since.',
  'My faith journey began in college when I joined a campus fellowship.',
  'I come from a Christian family and have been actively involved in church ministry.',
  'I rededicated my life to Christ a few years ago and it has transformed my perspective.',
  'Growing up in a believer\'s home, I learned to put God first in everything.',
  'My testimony is of God\'s faithfulness through difficult times and answered prayers.'
]

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
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

function generatePlaceholderImage(color: string): string {
  return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`
}

async function main() {
  console.log('🌱 Starting to seed 50 test profiles (25 male + 25 female)...')
  console.log('')

  const denominations = ['PENTECOSTAL', 'BAPTIST', 'METHODIST', 'PRESBYTERIAN', 'NON_DENOMINATIONAL', 'CSI', 'AG', 'MAR_THOMA']
  const educationLevels = ['BACHELOR', 'MASTER', 'DOCTORATE', 'PROFESSIONAL']
  const bodyTypes = ['SLIM', 'AVERAGE', 'ATHLETIC']
  const familyTypes = ['NUCLEAR', 'JOINT']
  const incomeRanges = ['THREE_TO_FIVE_LAKHS', 'FIVE_TO_SEVEN_LAKHS', 'SEVEN_TO_TEN_LAKHS', 'TEN_TO_FIFTEEN_LAKHS', 'FIFTEEN_TO_TWENTY_LAKHS']
  const involvements = ['REGULAR_ATTENDER', 'VOLUNTEER', 'MINISTRY_LEADER']

  const hashedPassword = await bcrypt.hash('Test@123', 10)

  console.log('📧 Creating 2 test accounts for you to use:')
  console.log('   Male Account:   john.test@demo.com / Test@123')
  console.log('   Female Account: sarah.test@demo.com / Test@123')
  console.log('')

  // Create specific test accounts first
  const testAccounts = [
    {
      gender: 'MALE',
      firstName: 'John',
      lastName: 'Test',
      email: 'john.test@demo.com',
      age: 28
    },
    {
      gender: 'FEMALE',
      firstName: 'Sarah',
      lastName: 'Test',
      email: 'sarah.test@demo.com',
      age: 26
    }
  ]

  for (const testAccount of testAccounts) {
    const dob = new Date(new Date().getFullYear() - testAccount.age, 5, 15)
    const city = 'Bangalore'
    const state = 'Karnataka'

    try {
      const user = await prisma.user.create({
        data: {
          email: testAccount.email,
          password: hashedPassword,
          name: `${testAccount.firstName} ${testAccount.lastName}`,
          phoneNumber: generatePhoneNumber(),
          phoneVerified: true,
          emailVerified: new Date(),
          onboardingCompleted: true,
          profile: {
            create: {
              dateOfBirth: dob,
              gender: testAccount.gender,
              city,
              state,
              country: 'India',
              openToRelocate: true,
              denomination: 'BAPTIST',
              churchName: 'Grace Community Church',
              yearsAsBeliever: 15,
              isBaptized: true,
              churchInvolvementLevel: 'VOLUNTEER',
              faithTestimony: 'I accepted Christ as my Savior at a young age and have been growing in faith ever since. I am actively involved in my local church and seek a partner who shares my commitment to faith.',
              height: testAccount.gender === 'MALE' ? 175 : 162,
              bodyType: 'AVERAGE',
              complexion: 'Fair',
              languages: ['English', 'Hindi', 'Kannada'],
              educationLevel: 'BACHELOR',
              fieldOfStudy: testAccount.gender === 'MALE' ? 'Computer Science' : 'Business Administration',
              occupation: testAccount.gender === 'MALE' ? 'Software Engineer' : 'Marketing Manager',
              incomeRange: 'TEN_TO_FIFTEEN_LAKHS',
              parentsOccupation: 'Father: Business, Mother: Teacher',
              siblingsCount: 1,
              birthOrder: 'Eldest',
              familyType: 'NUCLEAR',
              familyValues: 'Traditional Christian values',
              drinking: 'Never',
              smoking: 'Never',
              dietPreference: 'Non-vegetarian',
              hobbies: 'Reading, Music, Prayer groups, Traveling',
              aboutMe: `I am a ${testAccount.age}-year-old ${testAccount.gender === 'MALE' ? 'man' : 'woman'} seeking a life partner who shares my faith and values. I enjoy serving in church, spending time with family, and pursuing personal growth. I believe in building a Christ-centered home and partnership.`,
              completionPercentage: 100,
            }
          },
          partnerPreferences: {
            create: {
              ageMin: testAccount.gender === 'MALE' ? 24 : 26,
              ageMax: testAccount.gender === 'MALE' ? 32 : 35,
              heightMin: testAccount.gender === 'MALE' ? 155 : 170,
              heightMax: testAccount.gender === 'MALE' ? 170 : 185,
              educationLevels: ['BACHELOR', 'MASTER'],
              denominations: ['BAPTIST', 'PENTECOSTAL', 'NON_DENOMINATIONAL'],
              locations: ['Bangalore', 'Mumbai', 'Delhi'],
              incomeRange: 'FIVE_TO_SEVEN_LAKHS',
            }
          },
          photos: {
            create: [
              {
                url: generatePlaceholderImage('blue'),
                order: 0,
                isPrimary: true,
              }
            ]
          }
        }
      })

      console.log(`✅ Created test account: ${testAccount.firstName} ${testAccount.lastName} (${testAccount.gender})`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⏭️  Skipped: ${testAccount.email} (already exists)`)
      } else {
        console.error(`❌ Error creating ${testAccount.email}:`, error.message)
      }
    }
  }

  console.log('')
  console.log('🌱 Creating 48 more profiles (24 male + 24 female)...')
  console.log('')

  // Create 48 more profiles (24 of each gender)
  for (let i = 0; i < 48; i++) {
    const gender: string = i % 2 === 0 ? 'MALE' : 'FEMALE'
    const firstName = gender === 'MALE'
      ? randomElement(FIRST_NAMES_MALE)
      : randomElement(FIRST_NAMES_FEMALE)
    const lastName = randomElement(LAST_NAMES)
    const fullName = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 100}@example.com`
    const phoneNumber = generatePhoneNumber()
    const dob = generateDOB(22, 40)
    const city = randomElement(CITIES)
    const state = randomElement(STATES)
    const denomination = randomElement(denominations)
    const height = gender === 'MALE' ? randomNumber(165, 185) : randomNumber(152, 170)

    try {
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
              country: 'India',
              openToRelocate: Math.random() > 0.5,
              denomination,
              churchName: randomElement(CHURCHES),
              yearsAsBeliever: randomNumber(2, 25),
              isBaptized: Math.random() > 0.2,
              churchInvolvementLevel: randomElement(involvements),
              faithTestimony: randomElement(TESTIMONIES),
              height,
              bodyType: randomElement(bodyTypes),
              complexion: randomElement(['Fair', 'Wheatish', 'Dusky']),
              languages: ['English', 'Hindi', randomElement(['Tamil', 'Telugu', 'Malayalam', 'Kannada'])],
              educationLevel: randomElement(educationLevels),
              fieldOfStudy: randomElement(FIELDS_OF_STUDY),
              occupation: randomElement(OCCUPATIONS),
              incomeRange: randomElement(incomeRanges),
              parentsOccupation: `Father: ${randomElement(['Retired', 'Business', 'Government Service'])}, Mother: ${randomElement(['Homemaker', 'Teacher', 'Nurse'])}`,
              siblingsCount: randomNumber(0, 2),
              birthOrder: randomElement(['Only child', 'Eldest', 'Youngest']),
              familyType: randomElement(familyTypes),
              familyValues: 'Traditional Christian values',
              drinking: 'Never',
              smoking: 'Never',
              dietPreference: randomElement(['Vegetarian', 'Eggetarian', 'Non-vegetarian']),
              hobbies: randomElement(HOBBIES),
              aboutMe: `I am a ${gender === 'MALE' ? 'man' : 'woman'} of faith seeking a life partner who shares my values and beliefs. I enjoy serving in church and am looking forward to building a Christ-centered home.`,
              completionPercentage: 100,
            }
          },
          partnerPreferences: {
            create: {
              ageMin: Math.max(22, dob.getFullYear() - new Date().getFullYear() - 5),
              ageMax: dob.getFullYear() - new Date().getFullYear() + 8,
              heightMin: gender === 'MALE' ? 152 : 165,
              heightMax: gender === 'MALE' ? 170 : 185,
              educationLevels: [randomElement(educationLevels), randomElement(educationLevels)],
              denominations: [denomination, randomElement(denominations)],
              locations: [city, randomElement(CITIES)],
              incomeRange: randomElement(incomeRanges),
            }
          },
          photos: {
            create: [
              {
                url: generatePlaceholderImage('blue'),
                order: 0,
                isPrimary: true,
              }
            ]
          }
        }
      })

      if ((i + 1) % 5 === 0) {
        console.log(`✅ Created ${i + 1}/48 profiles...`)
      }
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⏭️  Skipped profile ${i + 1} (duplicate)`)
      } else {
        console.error(`❌ Error creating profile ${i + 1}:`, error.message)
      }
    }
  }

  console.log('')
  console.log('✅ Seeding completed!')
  console.log('')
  console.log('🎉 50 test profiles created!')
  console.log('')
  console.log('📧 Use these credentials to test:')
  console.log('   Male:   john.test@demo.com / Test@123')
  console.log('   Female: sarah.test@demo.com / Test@123')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
