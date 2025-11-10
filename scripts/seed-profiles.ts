import { PrismaClient, Gender, Denomination, EducationLevel, BodyType, FamilyType, IncomeRange, ChurchInvolvement } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Indian cities
const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam',
  'Coimbatore', 'Kochi', 'Guwahati', 'Chandigarh', 'Mysore', 'Thiruvananthapuram'
]

const STATES = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat',
  'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh', 'Kerala', 'Assam', 'Punjab'
]

const FIRST_NAMES_MALE = [
  'John', 'David', 'Michael', 'Samuel', 'Daniel', 'Joseph', 'Thomas', 'James', 'Paul', 'Peter',
  'Matthew', 'Mark', 'Luke', 'Andrew', 'Philip', 'Stephen', 'Timothy', 'Benjamin', 'Joshua', 'Caleb',
  'Abraham', 'Isaac', 'Jacob', 'Elijah', 'Nathan', 'Joel', 'Ezra', 'Reuben', 'Simon', 'Aaron'
]

const FIRST_NAMES_FEMALE = [
  'Sarah', 'Mary', 'Ruth', 'Esther', 'Rachel', 'Hannah', 'Elizabeth', 'Grace', 'Faith', 'Hope',
  'Joy', 'Priya', 'Rebecca', 'Anna', 'Martha', 'Deborah', 'Lydia', 'Naomi', 'Leah', 'Abigail',
  'Emily', 'Sophia', 'Emma', 'Olivia', 'Chloe', 'Zoe', 'Eva', 'Maria', 'Rose', 'Lucy'
]

const LAST_NAMES = [
  'Kumar', 'Sharma', 'Singh', 'Patel', 'Reddy', 'Nair', 'Menon', 'Thomas', 'Joseph', 'Samuel',
  'David', 'Paul', 'Raju', 'Rao', 'Varghese', 'George', 'Abraham', 'John', 'Peter', 'Philip',
  'Matthew', 'Luke', 'Mark', 'Stephen', 'Daniel', 'Joshua', 'Benjamin', 'Nathan', 'Jacob', 'Isaac'
]

const CHURCHES = [
  'Grace Community Church', 'Faith Assembly', 'Bethel Church', 'New Life Fellowship',
  'Victory Church', 'Lighthouse Church', 'Emmanuel Baptist Church', 'Calvary Chapel',
  'Cornerstone Church', 'Living Waters Church', 'Hope Church', 'Redeemer Church',
  'Trinity Church', 'Gospel Hall', 'Assembly of God Church', 'CSI Church',
  'CNI Cathedral', 'Mar Thoma Church', 'IPC Church', 'Pentecostal Mission'
]

const OCCUPATIONS = [
  'Software Engineer', 'Doctor', 'Teacher', 'Business Analyst', 'Accountant', 'Nurse',
  'Civil Engineer', 'Architect', 'Designer', 'Marketing Manager', 'Sales Executive',
  'Data Scientist', 'Product Manager', 'HR Manager', 'Financial Analyst', 'Consultant',
  'Professor', 'Lawyer', 'Pharmacist', 'Entrepreneur', 'Project Manager', 'Scientist'
]

const FIELDS_OF_STUDY = [
  'Computer Science', 'Medicine', 'Engineering', 'Business Administration', 'Commerce',
  'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Economics', 'Psychology',
  'Nursing', 'Pharmacy', 'Architecture', 'Design', 'Marketing', 'Finance', 'Law'
]

const COMPANIES = [
  'TCS', 'Infosys', 'Wipro', 'Cognizant', 'HCL', 'Tech Mahindra', 'Google', 'Microsoft',
  'Amazon', 'Flipkart', 'Accenture', 'Deloitte', 'KPMG', 'EY', 'PWC', 'IBM',
  'Apollo Hospitals', 'Fortis Healthcare', 'Max Healthcare', 'HDFC Bank', 'ICICI Bank'
]

const HOBBIES = [
  'Reading, Music, Prayer groups', 'Traveling, Photography, Bible study', 'Cooking, Singing, Ministry work',
  'Sports, Fitness, Volunteering', 'Art, Writing, Music', 'Dancing, Hiking, Reading',
  'Swimming, Cycling, Photography', 'Gardening, Cooking, Singing', 'Playing instruments, Bible study, Reading'
]

const TESTIMONIES = [
  'I accepted Christ as my Savior at a young age and have been growing in faith ever since.',
  'My faith journey began in college when I joined a campus fellowship.',
  'I come from a Christian family and have been actively involved in church ministry.',
  'I rededicated my life to Christ a few years ago and it has transformed my perspective.',
  'Growing up in a believer\'s home, I learned to put God first in everything.',
  'My testimony is of God\'s faithfulness through difficult times and answered prayers.',
  'I serve in my local church and am passionate about spreading the Gospel.'
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

// Simple placeholder image - a small colored square in base64
function generatePlaceholderImage(color: string): string {
  // This is a 1x1 pixel PNG in base64 - in production you'd use real images
  return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`
}

async function main() {
  console.log('🌱 Starting to seed 100 profiles...')

  const denominations = Object.values(Denomination)
  const educationLevels = Object.values(EducationLevel)
  const bodyTypes = Object.values(BodyType)
  const familyTypes = Object.values(FamilyType)
  const incomeRanges = Object.values(IncomeRange)
  const involvements = Object.values(ChurchInvolvement)

  const hashedPassword = await bcrypt.hash('Password123!', 10)

  for (let i = 0; i < 100; i++) {
    const gender: Gender = i % 2 === 0 ? Gender.MALE : Gender.FEMALE
    const firstName = gender === Gender.MALE
      ? randomElement(FIRST_NAMES_MALE)
      : randomElement(FIRST_NAMES_FEMALE)
    const lastName = randomElement(LAST_NAMES)
    const fullName = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`
    const phoneNumber = generatePhoneNumber()
    const dob = generateDOB(21, 45)
    const city = randomElement(CITIES)
    const state = randomElement(STATES)
    const denomination = randomElement(denominations)
    const height = gender === Gender.MALE ? randomNumber(165, 190) : randomNumber(152, 175)

    try {
      console.log(`Creating profile ${i + 1}/100: ${fullName}`)

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
              yearsAsBeliever: randomNumber(1, 30),
              isBaptized: Math.random() > 0.2,
              churchInvolvementLevel: randomElement(involvements),
              faithTestimony: randomElement(TESTIMONIES),
              height,
              bodyType: randomElement(bodyTypes),
              complexion: randomElement(['Fair', 'Wheatish', 'Dusky', 'Dark']),
              languages: ['English', 'Hindi', randomElement(['Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Marathi'])],
              educationLevel: randomElement(educationLevels),
              fieldOfStudy: randomElement(FIELDS_OF_STUDY),
              occupation: randomElement(OCCUPATIONS),
              incomeRange: randomElement(incomeRanges),
              parentsOccupation: `Father: ${randomElement(['Retired', 'Business', 'Government Service', 'Private Job'])}, Mother: ${randomElement(['Homemaker', 'Teacher', 'Nurse', 'Business'])}`,
              siblingsCount: randomNumber(0, 3),
              birthOrder: randomElement(['Only child', 'Eldest', 'Middle', 'Youngest']),
              familyType: randomElement(familyTypes),
              familyValues: randomElement(['Traditional', 'Moderate', 'Liberal', 'Orthodox Christian']),
              drinking: randomElement(['Never', 'Socially', 'Prefer not to say']),
              smoking: randomElement(['Never', 'Occasionally', 'Prefer not to say']),
              dietPreference: randomElement(['Vegetarian', 'Eggetarian', 'Non-vegetarian']),
              hobbies: randomElement(HOBBIES),
              aboutMe: `I am a ${gender === Gender.MALE ? 'man' : 'woman'} of faith seeking a life partner who shares my values and beliefs. I enjoy ${randomElement(['serving in church', 'spending time in fellowship', 'Bible study and prayer', 'ministry work'])} and am looking forward to building a Christ-centered home.`,
              completionPercentage: 100,
            }
          },
          partnerPreferences: {
            create: {
              ageMin: dob.getFullYear() - new Date().getFullYear() - 5,
              ageMax: dob.getFullYear() - new Date().getFullYear() + 10,
              heightMin: gender === Gender.MALE ? 152 : 165,
              heightMax: gender === Gender.MALE ? 175 : 190,
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
              },
              {
                url: generatePlaceholderImage('green'),
                order: 1,
                isPrimary: false,
              },
              {
                url: generatePlaceholderImage('red'),
                order: 2,
                isPrimary: false,
              }
            ]
          }
        }
      })

      console.log(`✅ Created: ${fullName} (${gender}) - ${city}`)
    } catch (error) {
      console.error(`❌ Error creating profile ${i + 1}:`, error)
      // Continue with next profile
    }
  }

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
