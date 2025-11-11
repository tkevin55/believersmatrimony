-- Seed script for Believers Matrimony
-- Run this in your Neon Database SQL Editor
-- Password for all accounts: Test@123

-- Insert Test User 1: John Test (Male, 28, Software Engineer, Bangalore)
INSERT INTO "User" (id, email, password, name, "phoneNumber", "phoneVerified", "emailVerified", "onboardingCompleted", "createdAt", "updatedAt")
VALUES
('cm3duhjhb0001test0000john1', 'john.test@demo.com', '$2a$10$Fd4FyKPLso7ty9PYdSKUMOtoZHn69n0zmrET1GSyui1knVTKcuChG', 'John Test', '+919876543210', true, NOW(), true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert Profile for John
INSERT INTO "Profile" ("userId", "dateOfBirth", gender, city, state, country, "openToRelocate", denomination, "churchName", "yearsAsBeliever", "isBaptized", "churchInvolvementLevel", "faithTestimony", height, "bodyType", complexion, languages, "educationLevel", "fieldOfStudy", occupation, "incomeRange", "parentsOccupation", "siblingsCount", "birthOrder", "familyType", "familyValues", drinking, smoking, "dietPreference", hobbies, "aboutMe", "completionPercentage", "createdAt", "updatedAt")
VALUES
('cm3duhjhb0001test0000john1', '1997-06-15', 'MALE', 'Bangalore', 'Karnataka', 'India', true, 'BAPTIST', 'Grace Community Church', 15, true, 'VOLUNTEER', 'I accepted Christ as my Savior at a young age and have been growing in faith ever since. I am actively involved in my local church and seek a partner who shares my commitment to faith.', 175, 'AVERAGE', 'Fair', ARRAY['English', 'Hindi', 'Kannada'], 'BACHELOR', 'Computer Science', 'Software Engineer', 'TEN_TO_FIFTEEN_LAKHS', 'Father: Business, Mother: Teacher', 1, 'Eldest', 'NUCLEAR', 'Traditional Christian values', 'Never', 'Never', 'Non-vegetarian', 'Reading, Music, Prayer groups, Traveling', 'I am a 28-year-old man seeking a life partner who shares my faith and values. I enjoy serving in church, spending time with family, and pursuing personal growth. I believe in building a Christ-centered home and partnership.', 100, NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

-- Insert Partner Preferences for John
INSERT INTO "PartnerPreferences" ("userId", "ageMin", "ageMax", "heightMin", "heightMax", "educationLevels", denominations, locations, "incomeRange", "createdAt", "updatedAt")
VALUES
('cm3duhjhb0001test0000john1', 24, 35, 155, 170, ARRAY['BACHELOR', 'MASTER']::text[], ARRAY['BAPTIST', 'PENTECOSTAL', 'NON_DENOMINATIONAL']::text[], ARRAY['Bangalore', 'Mumbai', 'Delhi'], 'FIVE_TO_SEVEN_LAKHS', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

-- Insert Photo for John
INSERT INTO "Photo" ("userId", url, "order", "isPrimary", "createdAt", "updatedAt")
VALUES
('cm3duhjhb0001test0000john1', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert Test User 2: Sarah Test (Female, 26, Marketing Manager, Mumbai)
INSERT INTO "User" (id, email, password, name, "phoneNumber", "phoneVerified", "emailVerified", "onboardingCompleted", "createdAt", "updatedAt")
VALUES
('cm3duhjhb0002test0000sara1', 'sarah.test@demo.com', '$2a$10$Fd4FyKPLso7ty9PYdSKUMOtoZHn69n0zmrET1GSyui1knVTKcuChG', 'Sarah Test', '+919876543211', true, NOW(), true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert Profile for Sarah
INSERT INTO "Profile" ("userId", "dateOfBirth", gender, city, state, country, "openToRelocate", denomination, "churchName", "yearsAsBeliever", "isBaptized", "churchInvolvementLevel", "faithTestimony", height, "bodyType", complexion, languages, "educationLevel", "fieldOfStudy", occupation, "incomeRange", "parentsOccupation", "siblingsCount", "birthOrder", "familyType", "familyValues", drinking, smoking, "dietPreference", hobbies, "aboutMe", "completionPercentage", "createdAt", "updatedAt")
VALUES
('cm3duhjhb0002test0000sara1', '1999-06-15', 'FEMALE', 'Mumbai', 'Maharashtra', 'India', true, 'BAPTIST', 'Grace Community Church', 13, true, 'VOLUNTEER', 'I accepted Christ as my Savior at a young age and have been growing in faith ever since. I am actively involved in my local church and seek a partner who shares my commitment to faith.', 162, 'AVERAGE', 'Fair', ARRAY['English', 'Hindi', 'Marathi'], 'BACHELOR', 'Business Administration', 'Marketing Manager', 'TEN_TO_FIFTEEN_LAKHS', 'Father: Business, Mother: Teacher', 1, 'Eldest', 'NUCLEAR', 'Traditional Christian values', 'Never', 'Never', 'Non-vegetarian', 'Reading, Music, Prayer groups, Traveling', 'I am a 26-year-old woman seeking a life partner who shares my faith and values. I enjoy serving in church, spending time with family, and pursuing personal growth. I believe in building a Christ-centered home and partnership.', 100, NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

-- Insert Partner Preferences for Sarah
INSERT INTO "PartnerPreferences" ("userId", "ageMin", "ageMax", "heightMin", "heightMax", "educationLevels", denominations, locations, "incomeRange", "createdAt", "updatedAt")
VALUES
('cm3duhjhb0002test0000sara1', 26, 35, 170, 185, ARRAY['BACHELOR', 'MASTER']::text[], ARRAY['BAPTIST', 'PENTECOSTAL', 'NON_DENOMINATIONAL']::text[], ARRAY['Bangalore', 'Mumbai', 'Delhi'], 'FIVE_TO_SEVEN_LAKHS', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

-- Insert Photo for Sarah
INSERT INTO "Photo" ("userId", url, "order", "isPrimary", "createdAt", "updatedAt")
VALUES
('cm3duhjhb0002test0000sara1', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert Test User 3: David Test (Male, 30, Data Scientist, Delhi)
INSERT INTO "User" (id, email, password, name, "phoneNumber", "phoneVerified", "emailVerified", "onboardingCompleted", "createdAt", "updatedAt")
VALUES
('cm3duhjhb0003test0000davi1', 'david.test@demo.com', '$2a$10$Fd4FyKPLso7ty9PYdSKUMOtoZHn69n0zmrET1GSyui1knVTKcuChG', 'David Test', '+919876543212', true, NOW(), true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert Profile for David
INSERT INTO "Profile" ("userId", "dateOfBirth", gender, city, state, country, "openToRelocate", denomination, "churchName", "yearsAsBeliever", "isBaptized", "churchInvolvementLevel", "faithTestimony", height, "bodyType", complexion, languages, "educationLevel", "fieldOfStudy", occupation, "incomeRange", "parentsOccupation", "siblingsCount", "birthOrder", "familyType", "familyValues", drinking, smoking, "dietPreference", hobbies, "aboutMe", "completionPercentage", "createdAt", "updatedAt")
VALUES
('cm3duhjhb0003test0000davi1', '1995-06-15', 'MALE', 'Delhi', 'Delhi', 'India', true, 'PENTECOSTAL', 'New Life Fellowship', 18, true, 'MINISTRY_LEADER', 'I grew up in a Christian home and have been actively serving in church ministry for over 10 years. I believe in building a strong foundation of faith in marriage.', 178, 'ATHLETIC', 'Wheatish', ARRAY['English', 'Hindi', 'Punjabi'], 'MASTER', 'Computer Science', 'Data Scientist', 'FIFTEEN_TO_TWENTY_LAKHS', 'Father: Pastor, Mother: Teacher', 2, 'Eldest', 'NUCLEAR', 'Strong Christian values', 'Never', 'Never', 'Vegetarian', 'Bible study, Sports, Music ministry', 'I am a 30-year-old man passionate about my faith and career. I seek a partner who shares my values and vision for a Christ-centered family. I enjoy ministry work and mentoring young believers.', 100, NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

-- Insert Partner Preferences for David
INSERT INTO "PartnerPreferences" ("userId", "ageMin", "ageMax", "heightMin", "heightMax", "educationLevels", denominations, locations, "incomeRange", "createdAt", "updatedAt")
VALUES
('cm3duhjhb0003test0000davi1', 25, 32, 155, 168, ARRAY['BACHELOR', 'MASTER']::text[], ARRAY['PENTECOSTAL', 'BAPTIST', 'NON_DENOMINATIONAL']::text[], ARRAY['Delhi', 'Bangalore', 'Gurgaon'], 'SEVEN_TO_TEN_LAKHS', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

-- Insert Photo for David
INSERT INTO "Photo" ("userId", url, "order", "isPrimary", "createdAt", "updatedAt")
VALUES
('cm3duhjhb0003test0000davi1', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Success message
SELECT
    '✅ Database seeded successfully!' as message,
    'Test Account Credentials:' as info,
    '1. john.test@demo.com / Test@123 (28M, Software Engineer, Bangalore)' as account1,
    '2. sarah.test@demo.com / Test@123 (26F, Marketing Manager, Mumbai)' as account2,
    '3. david.test@demo.com / Test@123 (30M, Data Scientist, Delhi)' as account3,
    'All accounts are fully onboarded!' as status;
