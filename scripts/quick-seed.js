// Simple Node.js seed script
const { PrismaClient, Gender, Denomination, EducationLevel, BodyType, FamilyType, IncomeRange, ChurchInvolvement } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  const hashedPassword = await bcrypt.hash('Test@123', 10);

  // Create 3 fully onboarded test accounts
  const testAccounts = [
    {
      email: 'john.test@demo.com',
      name: 'John Test',
      phone: '+919876543210',
      gender: Gender.MALE,
      age: 28,
      city: 'Bangalore',
      occupation: 'Software Engineer',
      fieldOfStudy: 'Computer Science'
    },
    {
      email: 'sarah.test@demo.com',
      name: 'Sarah Test',
      phone: '+919876543211',
      gender: Gender.FEMALE,
      age: 26,
      city: 'Mumbai',
      occupation: 'Marketing Manager',
      fieldOfStudy: 'Business Administration'
    },
    {
      email: 'david.test@demo.com',
      name: 'David Test',
      phone: '+919876543212',
      gender: Gender.MALE,
      age: 30,
      city: 'Delhi',
      occupation: 'Data Scientist',
      fieldOfStudy: 'Computer Science'
    }
  ];

  console.log('Creating test accounts with full onboarding...\n');

  for (const account of testAccounts) {
    try {
      const dob = new Date(new Date().getFullYear() - account.age, 5, 15);

      const user = await prisma.user.create({
        data: {
          email: account.email,
          password: hashedPassword,
          name: account.name,
          phoneNumber: account.phone,
          phoneVerified: true,
          emailVerified: new Date(),
          onboardingCompleted: true,
          profile: {
            create: {
              dateOfBirth: dob,
              gender: account.gender,
              city: account.city,
              state: account.city === 'Bangalore' ? 'Karnataka' : account.city === 'Mumbai' ? 'Maharashtra' : 'Delhi',
              country: 'India',
              openToRelocate: true,
              denomination: Denomination.BAPTIST,
              churchName: 'Grace Community Church',
              yearsAsBeliever: 15,
              isBaptized: true,
              churchInvolvementLevel: ChurchInvolvement.VOLUNTEER,
              faithTestimony: 'I accepted Christ as my Savior at a young age and have been growing in faith ever since. I am actively involved in my local church and seek a partner who shares my commitment to faith.',
              height: account.gender === Gender.MALE ? 175 : 162,
              bodyType: BodyType.AVERAGE,
              complexion: 'Fair',
              languages: ['English', 'Hindi'],
              educationLevel: EducationLevel.BACHELOR,
              fieldOfStudy: account.fieldOfStudy,
              occupation: account.occupation,
              incomeRange: IncomeRange.TEN_TO_FIFTEEN_LAKHS,
              parentsOccupation: 'Father: Business, Mother: Teacher',
              siblingsCount: 1,
              birthOrder: 'Eldest',
              familyType: FamilyType.NUCLEAR,
              familyValues: 'Traditional Christian values',
              drinking: 'Never',
              smoking: 'Never',
              dietPreference: 'Non-vegetarian',
              hobbies: 'Reading, Music, Prayer groups, Traveling',
              aboutMe: `I am a ${account.age}-year-old ${account.gender === Gender.MALE ? 'man' : 'woman'} seeking a life partner who shares my faith and values. I enjoy serving in church, spending time with family, and pursuing personal growth. I believe in building a Christ-centered home and partnership.`,
              completionPercentage: 100,
            }
          },
          partnerPreferences: {
            create: {
              ageMin: account.gender === Gender.MALE ? 24 : 26,
              ageMax: account.gender === Gender.MALE ? 35 : 38,
              heightMin: account.gender === Gender.MALE ? 155 : 170,
              heightMax: account.gender === Gender.MALE ? 170 : 185,
              educationLevels: [EducationLevel.BACHELOR, EducationLevel.MASTER],
              denominations: [Denomination.BAPTIST, Denomination.PENTECOSTAL, Denomination.NON_DENOMINATIONAL],
              locations: ['Bangalore', 'Mumbai', 'Delhi'],
              incomeRange: IncomeRange.FIVE_TO_SEVEN_LAKHS,
            }
          },
          photos: {
            create: [
              {
                url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                order: 0,
                isPrimary: true,
              }
            ]
          }
        }
      });

      console.log(`✅ Created: ${account.name} (${account.email})`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⏭️  Skipped: ${account.email} (already exists)`);
      } else {
        console.log(`❌ Error creating ${account.email}:`, error.message);
      }
    }
  }

  console.log('\n✅ Seeding completed!\n');
  console.log('🔑 Test Account Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Email: john.test@demo.com');
  console.log('   Password: Test@123');
  console.log('   Profile: 28M, Software Engineer, Bangalore\n');
  console.log('2. Email: sarah.test@demo.com');
  console.log('   Password: Test@123');
  console.log('   Profile: 26F, Marketing Manager, Mumbai\n');
  console.log('3. Email: david.test@demo.com');
  console.log('   Password: Test@123');
  console.log('   Profile: 30M, Data Scientist, Delhi\n');
  console.log('All accounts are fully onboarded and ready to use!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
