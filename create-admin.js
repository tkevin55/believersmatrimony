const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
        onboardingCompleted: true,
        profile: {
          create: {
            gender: 'MALE',
            dateOfBirth: new Date('1990-01-01'),
            denomination: 'NON_DENOMINATIONAL',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            height: 170,
            educationLevel: 'BACHELOR',
            occupation: 'Administrator',
            aboutMe: 'Platform administrator',
            churchName: 'Community Church',
            isBaptized: true,
            openToRelocate: false,
            isVisible: true,
            profileViews: 0,
            completionPercentage: 100,
          }
        },
        partnerPreferences: {
          create: {
            ageMin: 25,
            ageMax: 35,
            heightMin: 150,
            heightMax: 180,
            educationLevels: ['BACHELOR', 'MASTER'],
            denominations: ['NON_DENOMINATIONAL'],
          }
        }
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: Admin123!');
    console.log('👤 Role: ADMIN');
    console.log('\n🚀 Now run: npm run dev');
    console.log('🌐 Then login at: http://localhost:3000/auth/login');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2002') {
      console.log('\n💡 User already exists! Try logging in or use a different email.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
