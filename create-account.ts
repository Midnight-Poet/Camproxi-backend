import { PrismaClient, AdminRole, AgentCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = await bcrypt.hash('password123', 10);

  // ---------------------------------------------------------
  // 1. CREATE AN ADMIN ACCOUNT
  // ---------------------------------------------------------
  
  const newAdmin = await prisma.admin.create({
    data: {
      name: 'Super Admin',
      email: 'admin@camproxi.com',
      username: 'admin',
      password: defaultPassword,
      role: AdminRole.SUPER_ADMIN, // Can be SUPER_ADMIN, ADMIN, or OFFICIAL
    },
  });
  console.log('Created Admin:', newAdmin.email);
  

  // ---------------------------------------------------------
  // 2. CREATE A STUDENT ACCOUNT
  // ---------------------------------------------------------
  /*
  // Note: Needs a valid school ID from your DB first!
  const school = await prisma.school.findFirst();
  if (!school) throw new Error("Please create a school in the DB first");

  const newStudent = await prisma.user.create({
    data: {
      firstName: 'Jane',
      lastName: 'Student',
      username: 'jane_doe',
      email: 'jane@student.com',
      password: defaultPassword,
      schoolId: school.id,
      campusName: 'Main Campus',
      isverified: true,
      emailVerified: true,
    },
  });
  console.log('Created Student:', newStudent.email);
  */

  // ---------------------------------------------------------
  // 3. CREATE AN AGENT ACCOUNT
  // ---------------------------------------------------------
  /*
  // Note: Needs a valid school ID from your DB first!
  const school = await prisma.school.findFirst();
  if (!school) throw new Error("Please create a school in the DB first");

  const newAgent = await prisma.agent.create({
    data: {
      firstName: 'Bob',
      lastName: 'Agent',
      username: 'bob_agent',
      companyName: 'Bob Properties',
      email: 'bob@agent.com',
      password: defaultPassword,
      phone: '08012345678',
      category: AgentCategory.AGENT, // AGENT, VENDOR, or SERVICE_PROVIDER
      schoolId: school.id,
      campusName: 'Main Campus',
      isverified: true,
      emailVerified: true,
    },
  });
  console.log('Created Agent:', newAgent.email);
  */

  console.log('Please uncomment the section you want to run in create-account.ts');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
