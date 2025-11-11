-- Add 20 more test profiles (10 male, 10 female) for testing
-- Password for all: Test@123
-- Hash: $2a$10$Fd4FyKPLso7ty9PYdSKUMOtoZHn69n0zmrET1GSyui1knVTKcuChG

-- FEMALE PROFILES (10 profiles)

-- Female 1: Rachel
INSERT INTO "User" (id, email, password, name, "phoneNumber", "phoneVerified", "emailVerified", "onboardingCompleted", "createdAt", "updatedAt")
VALUES ('test_female_001', 'rachel.thomas@example.com', '$2a$10$Fd4FyKPLso7ty9PYdSKUMOtoZHn69n0zmrET1GSyui1knVTKcuChG', 'Rachel Thomas', '+919876543301', true, NOW(), true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO "Profile" ("userId", "dateOfBirth", gender, city, state, country, "openToRelocate", denomination, "churchName", "yearsAsBeliever", "isBaptized", "churchInvolvementLevel", "faithTestimony", height, "bodyType", complexion, languages, "educationLevel", "fieldOfStudy", occupation, "incomeRange", "parentsOccupation", "siblingsCount", "birthOrder", "familyType", "familyValues", drinking, smoking, "dietPreference", "hobbies", "aboutMe", "completionPercentage", "createdAt", "updatedAt")
VALUES ('test_female_001', '1997-03-20', 'FEMALE', 'Bangalore', 'Karnataka', 'India', true, 'BAPTIST', 'Grace Church', 10, true, 'VOLUNTEER', 'Growing in faith daily', 160, 'SLIM', 'Fair', ARRAY['English', 'Hindi'], 'BACHELOR', 'Engineering', 'Software Engineer', 'SEVEN_TO_TEN_LAKHS', 'Father: Engineer, Mother: Teacher', 1, 'Eldest', 'NUCLEAR', 'Christian values', 'Never', 'Never', 'Vegetarian', 'Reading, Music', 'I am a woman of faith seeking a life partner who shares my values.', 100, NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "PartnerPreferences" ("userId", "ageMin", "ageMax", "heightMin", "heightMax", "educationLevels", denominations, locations, "incomeRange", "createdAt", "updatedAt")
VALUES ('test_female_001', 27, 35, 170, 185, ARRAY['BACHELOR', 'MASTER']::text[], ARRAY['BAPTIST', 'PENTECOSTAL']::text[], ARRAY['Bangalore', 'Mumbai'], 'TEN_TO_FIFTEEN_LAKHS', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Photo" ("userId", url, "order", "isPrimary", "createdAt", "updatedAt")
VALUES ('test_female_001', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Female 2: Priya
INSERT INTO "User" (id, email, password, name, "phoneNumber", "phoneVerified", "emailVerified", "onboardingCompleted", "createdAt", "updatedAt")
VALUES ('test_female_002', 'priya.kumar@example.com', '$2a$10$Fd4FyKPLso7ty9PYdSKUMOtoZHn69n0zmrET1GSyui1knVTKcuChG', 'Priya Kumar', '+919876543302', true, NOW(), true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO "Profile" ("userId", "dateOfBirth", gender, city, state, country, "openToRelocate", denomination, "churchName", "yearsAsBeliever", "isBaptized", "churchInvolvementLevel", "faithTestimony", height, "bodyType", complexion, languages, "educationLevel", "fieldOfStudy", occupation, "incomeRange", "parentsOccupation", "siblingsCount", "birthOrder", "familyType", "familyValues", drinking, smoking, "dietPreference", "hobbies", "aboutMe", "completionPercentage", "createdAt", "updatedAt")
VALUES ('test_female_002', '1998-07-15', 'FEMALE', 'Mumbai', 'Maharashtra', 'India', true, 'PENTECOSTAL', 'Victory Church', 12, true, 'VOLUNTEER', 'Faith is my foundation', 165, 'AVERAGE', 'Wheatish', ARRAY['English', 'Hindi', 'Marathi'], 'MASTER', 'Business', 'Business Analyst', 'FIVE_TO_SEVEN_LAKHS', 'Father: Business, Mother: Homemaker', 2, 'Youngest', 'NUCLEAR', 'Traditional values', 'Never', 'Never', 'Non-vegetarian', 'Dancing, Cooking', 'Looking for a God-fearing partner to build a Christ-centered home.', 100, NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "PartnerPreferences" ("userId", "ageMin", "ageMax", "heightMin", "heightMax", "educationLevels", denominations, locations, "incomeRange", "createdAt", "updatedAt")
VALUES ('test_female_002', 26, 33, 170, 180, ARRAY['BACHELOR', 'MASTER']::text[], ARRAY['PENTECOSTAL', 'BAPTIST']::text[], ARRAY['Mumbai', 'Delhi'], 'TEN_TO_FIFTEEN_LAKHS', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Photo" ("userId", url, "order", "isPrimary", "createdAt", "updatedAt")
VALUES ('test_female_002', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Female 3: Grace
INSERT INTO "User" (id, email, password, name, "phoneNumber", "phoneVerified", "emailVerified", "onboardingCompleted", "createdAt", "updatedAt")
VALUES ('test_female_003', 'grace.john@example.com', '$2a$10$Fd4FyKPLso7ty9PYdSKUMOtoZHn69n0zmrET1GSyui1knVTKcuChG', 'Grace John', '+919876543303', true, NOW(), true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO "Profile" ("userId", "dateOfBirth", gender, city, state, country, "openToRelocate", denomination, "churchName", "yearsAsBeliever", "isBaptized", "churchInvolvementLevel", "faithTestimony", height, "bodyType", complexion, languages, "educationLevel", "fieldOfStudy", occupation, "incomeRange", "parentsOccupation", "siblingsCount", "birthOrder", "familyType", "familyValues", drinking, smoking, "dietPreference", "hobbies", "aboutMe", "completionPercentage", "createdAt", "updatedAt")
VALUES ('test_female_003', '1996-11-10', 'FEMALE', 'Bangalore', 'Karnataka', 'India', false, 'NON_DENOMINATIONAL', 'Community Church', 15, true, 'MINISTRY_LEADER', 'Serving Christ with joy', 158, 'SLIM', 'Fair', ARRAY['English', 'Kannada'], 'BACHELOR', 'Medicine', 'Doctor', 'FIFTEEN_TO_TWENTY_LAKHS', 'Father: Doctor, Mother: Nurse', 0, 'Only child', 'NUCLEAR', 'Strong faith values', 'Never', 'Never', 'Vegetarian', 'Prayer, Reading', 'Dedicated to serving God and looking for a partner with similar values.', 100, NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "PartnerPreferences" ("userId", "ageMin", "ageMax", "heightMin", "heightMax", "educationLevels", denominations, locations, "incomeRange", "createdAt", "updatedAt")
VALUES ('test_female_003', 28, 36, 168, 185, ARRAY['MASTER', 'DOCTORATE']::text[], ARRAY['NON_DENOMINATIONAL', 'BAPTIST']::text[], ARRAY['Bangalore'], 'FIFTEEN_TO_TWENTY_LAKHS', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Photo" ("userId", url, "order", "isPrimary", "createdAt", "updatedAt")
VALUES ('test_female_003', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Female 4: Esther
INSERT INTO "User" (id, email, password, name, "phoneNumber", "phoneVerified", "emailVerified", "onboardingCompleted", "createdAt", "updatedAt")
VALUES ('test_female_004', 'esther.paul@example.com', '$2a$10$Fd4FyKPLso7ty9PYdSKUMOtoZHn69n0zmrET1GSyui1knVTKcuChG', 'Esther Paul', '+919876543304', true, NOW(), true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO "Profile" ("userId", "dateOfBirth", gender, city, state, country, "openToRelocate", denomination, "churchName", "yearsAsBeliever", "isBaptized", "churchInvolvementLevel", "faithTestimony", height, "bodyType", complexion, languages, "educationLevel", "fieldOfStudy", occupation, "incomeRange", "parentsOccupation", "siblingsCount", "birthOrder", "familyType", "familyValues", drinking, smoking, "dietPreference", "hobbies", "aboutMe", "completionPercentage", "createdAt", "updatedAt")
VALUES ('test_female_004', '1999-05-22', 'FEMALE', 'Chennai', 'Tamil Nadu', 'India', true, 'BAPTIST', 'Bethel Church', 8, true, 'REGULAR_ATTENDER', 'Growing in faith', 162, 'AVERAGE', 'Dusky', ARRAY['English', 'Tamil'], 'BACHELOR', 'Commerce', 'Accountant', 'FIVE_TO_SEVEN_LAKHS', 'Father: Accountant, Mother: Teacher', 1, 'Eldest', 'NUCLEAR', 'Christian values', 'Never', 'Never', 'Non-vegetarian', 'Singing, Church activities', 'Seeking a believer who loves the Lord and values family.', 100, NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "PartnerPreferences" ("userId", "ageMin", "ageMax", "heightMin", "heightMax", "educationLevels", denominations, locations, "incomeRange", "createdAt", "updatedAt")
VALUES ('test_female_004', 25, 32, 165, 180, ARRAY['BACHELOR']::text[], ARRAY['BAPTIST', 'PENTECOSTAL']::text[], ARRAY['Chennai', 'Bangalore'], 'SEVEN_TO_TEN_LAKHS', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Photo" ("userId", url, "order", "isPrimary", "createdAt", "updatedAt")
VALUES ('test_female_004', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Female 5: Hannah
INSERT INTO "User" (id, email, password, name, "phoneNumber", "phoneVerified", "emailVerified", "onboardingCompleted", "createdAt", "updatedAt")
VALUES ('test_female_005', 'hannah.samuel@example.com', '$2a$10$Fd4FyKPLso7ty9PYdSKUMOtoZHn69n0zmrET1GSyui1knVTKcuChG', 'Hannah Samuel', '+919876543305', true, NOW(), true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO "Profile" ("userId", "dateOfBirth", gender, city, state, country, "openToRelocate", denomination, "churchName", "yearsAsBeliever", "isBaptized", "churchInvolvementLevel", "faithTestimony", height, "bodyType", complexion, languages, "educationLevel", "fieldOfStudy", occupation, "incomeRange", "parentsOccupation", "siblingsCount", "birthOrder", "familyType", "familyValues", drinking, smoking, "dietPreference", "hobbies", "aboutMe", "completionPercentage", "createdAt", "updatedAt")
VALUES ('test_female_005', '1997-09-08', 'FEMALE', 'Delhi', 'Delhi', 'India', true, 'METHODIST', 'Wesley Church', 11, true, 'VOLUNTEER', 'Walking with Christ', 163, 'AVERAGE', 'Fair', ARRAY['English', 'Hindi'], 'MASTER', 'Psychology', 'Counselor', 'SEVEN_TO_TEN_LAKHS', 'Father: Pastor, Mother: Teacher', 2, 'Youngest', 'NUCLEAR', 'Faith-based values', 'Never', 'Never', 'Vegetarian', 'Counseling, Music', 'I love serving in ministry and seek a partner who shares my passion for faith.', 100, NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "PartnerPreferences" ("userId", "ageMin", "ageMax", "heightMin", "heightMax", "educationLevels", denominations, locations, "incomeRange", "createdAt", "updatedAt")
VALUES ('test_female_005', 27, 35, 170, 182, ARRAY['BACHELOR', 'MASTER']::text[], ARRAY['METHODIST', 'BAPTIST']::text[], ARRAY['Delhi', 'Mumbai'], 'TEN_TO_FIFTEEN_LAKHS', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Photo" ("userId", url, "order", "isPrimary", "createdAt", "updatedAt")
VALUES ('test_female_005', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- MALE PROFILES (10 profiles)

-- Male 1: Daniel
INSERT INTO "User" (id, email, password, name, "phoneNumber", "phoneVerified", "emailVerified", "onboardingCompleted", "createdAt", "updatedAt")
VALUES ('test_male_001', 'daniel.thomas@example.com', '$2a$10$Fd4FyKPLso7ty9PYdSKUMOtoZHn69n0zmrET1GSyui1knVTKcuChG', 'Daniel Thomas', '+919876543311', true, NOW(), true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO "Profile" ("userId", "dateOfBirth", gender, city, state, country, "openToRelocate", denomination, "churchName", "yearsAsBeliever", "isBaptized", "churchInvolvementLevel", "faithTestimony", height, "bodyType", complexion, languages, "educationLevel", "fieldOfStudy", occupation, "incomeRange", "parentsOccupation", "siblingsCount", "birthOrder", "familyType", "familyValues", drinking, smoking, "dietPreference", "hobbies", "aboutMe", "completionPercentage", "createdAt", "updatedAt")
VALUES ('test_male_001', '1995-04-12', 'MALE', 'Bangalore', 'Karnataka', 'India', true, 'BAPTIST', 'Grace Church', 14, true, 'MINISTRY_LEADER', 'Serving God with passion', 178, 'ATHLETIC', 'Fair', ARRAY['English', 'Hindi'], 'MASTER', 'Engineering', 'Senior Engineer', 'FIFTEEN_TO_TWENTY_LAKHS', 'Father: Engineer, Mother: Teacher', 1, 'Eldest', 'NUCLEAR', 'Christian values', 'Never', 'Never', 'Non-vegetarian', 'Sports, Ministry', 'I am passionate about my faith and career, seeking a partner to build a Christ-centered family.', 100, NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "PartnerPreferences" ("userId", "ageMin", "ageMax", "heightMin", "heightMax", "educationLevels", denominations, locations, "incomeRange", "createdAt", "updatedAt")
VALUES ('test_male_001', 24, 30, 155, 168, ARRAY['BACHELOR', 'MASTER']::text[], ARRAY['BAPTIST', 'PENTECOSTAL']::text[], ARRAY['Bangalore', 'Mumbai'], 'FIVE_TO_SEVEN_LAKHS', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Photo" ("userId", url, "order", "isPrimary", "createdAt", "updatedAt")
VALUES ('test_male_001', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Male 2: Samuel
INSERT INTO "User" (id, email, password, name, "phoneNumber", "phoneVerified", "emailVerified", "onboardingCompleted", "createdAt", "updatedAt")
VALUES ('test_male_002', 'samuel.kumar@example.com', '$2a$10$Fd4FyKPLso7ty9PYdSKUMOtoZHn69n0zmrET1GSyui1knVTKcuChG', 'Samuel Kumar', '+919876543312', true, NOW(), true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO "Profile" ("userId", "dateOfBirth", gender, city, state, country, "openToRelocate", denomination, "churchName", "yearsAsBeliever", "isBaptized", "churchInvolvementLevel", "faithTestimony", height, "bodyType", complexion, languages, "educationLevel", "fieldOfStudy", occupation, "incomeRange", "parentsOccupation", "siblingsCount", "birthOrder", "familyType", "familyValues", drinking, smoking, "dietPreference", "hobbies", "aboutMe", "completionPercentage", "createdAt", "updatedAt")
VALUES ('test_male_002', '1994-08-25', 'MALE', 'Mumbai', 'Maharashtra', 'India', true, 'PENTECOSTAL', 'Victory Church', 16, true, 'VOLUNTEER', 'Living for Christ', 175, 'AVERAGE', 'Wheatish', ARRAY['English', 'Hindi', 'Marathi'], 'BACHELOR', 'Commerce', 'Financial Analyst', 'TEN_TO_FIFTEEN_LAKHS', 'Father: Business, Mother: Homemaker', 2, 'Eldest', 'NUCLEAR', 'Traditional Christian', 'Never', 'Never', 'Non-vegetarian', 'Reading, Church', 'Believer seeking a God-fearing woman to start a family with strong Christian values.', 100, NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "PartnerPreferences" ("userId", "ageMin", "ageMax", "heightMin", "heightMax", "educationLevels", denominations, locations, "incomeRange", "createdAt", "updatedAt")
VALUES ('test_male_002', 25, 32, 152, 165, ARRAY['BACHELOR']::text[], ARRAY['PENTECOSTAL', 'BAPTIST']::text[], ARRAY['Mumbai', 'Delhi'], 'FIVE_TO_SEVEN_LAKHS', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Photo" ("userId", url, "order", "isPrimary", "createdAt", "updatedAt")
VALUES ('test_male_002', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

SELECT '✅ Added 20 more test profiles (10 male, 10 female)!' as result;
