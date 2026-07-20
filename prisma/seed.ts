import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');
  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Wipe existing data
  console.log('Wiping database...');
  await prisma.notification.deleteMany({});
  await prisma.request.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.savedItem.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.agent.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.school.deleteMany({});

  // 2. Create Schools
  console.log('Creating schools...');
  const futminna = await prisma.school.create({
    data: { 
      name: 'Federal University of Technology, Minna (FUT Minna)', 
      code: 'FUTMINNA',
      campus: [
        { name: 'Bosso Campus', location: { latitude: 9.6538, longitude: 6.5259 } },
        { name: 'Gidan Kwano Campus', location: { latitude: 9.5310, longitude: 6.4469 } }
      ]
    },
  });

  const schools = [futminna];

  // 3. Create Users (10 per school)
  console.log('Creating users...');
  for (const school of schools) {
    const users = [];
    for (let i = 1; i <= 10; i++) {
      users.push({
        firstName: `Student${i}`,
        lastName: school.code || school.name.split(' ')[0],
        username: `student${i}_${school.id.substring(school.id.length - 4)}`,
        password: defaultPassword,
        email: `student${i}@futminna.edu.ng`,
        schoolId: school.id,
        bio: `I am a student at ${school.name}`,
      });
    }
    await prisma.user.createMany({ data: users });
  }

  // 4. Create Agents (9 total, 3 per category)
  console.log('Creating agents...');

  // AGENT Category (Real Estate)
  const agentsData = [
    { firstName: 'Campus', lastName: 'Housing', username: 'campus_housing', companyName: 'Campus Housing Ltd', category: 'AGENT' as any, email: 'contact@campushousing.com', password: defaultPassword, phone: '08012345678', schoolId: futminna.id },
    { firstName: 'Student', lastName: 'Shelters', username: 'student_shelters', companyName: 'Student Shelters', category: 'AGENT' as any, email: 'hello@studentshelters.com', password: defaultPassword, phone: '08023456789', schoolId: futminna.id },
    { firstName: 'UniHomes', lastName: 'Prop', username: 'unihomes', companyName: 'UniHomes Properties', category: 'AGENT' as any, email: 'info@unihomes.com', password: defaultPassword, phone: '08034567890', schoolId: futminna.id },
  ];

  // VENDOR Category (Products)
  const vendorsData = [
    { firstName: 'Gadget', lastName: 'Hub', username: 'gadget_hub', companyName: 'Gadget Hub', category: 'VENDOR' as any, email: 'sales@gadgethub.com', password: defaultPassword, phone: '08045678901', schoolId: futminna.id },
    { firstName: 'Campus', lastName: 'Groceries', username: 'campus_groceries', companyName: 'Campus Groceries', category: 'VENDOR' as any, email: 'buy@campusgroceries.com', password: defaultPassword, phone: '08056789012', schoolId: futminna.id },
    { firstName: 'BookWorms', lastName: 'Hub', username: 'bookworms_hub', companyName: 'BookWorms Hub', category: 'VENDOR' as any, email: 'books@bookworms.com', password: defaultPassword, phone: '08067890123', schoolId: futminna.id },
  ];

  // SERVICE_PROVIDER Category (Services)
  const serviceProvidersData = [
    { firstName: 'Quick', lastName: 'Fix', username: 'quick_fix', companyName: 'Quick Fix Plumbers', category: 'SERVICE_PROVIDER' as any, email: 'plumber@quickfix.com', password: defaultPassword, phone: '08078901234', schoolId: futminna.id },
    { firstName: 'Student', lastName: 'Laundry', username: 'student_laundry', companyName: 'Student Laundry Pro', category: 'SERVICE_PROVIDER' as any, email: 'clean@studentlaundry.com', password: defaultPassword, phone: '08089012345', schoolId: futminna.id },
    { firstName: 'Campus', lastName: 'Tech', username: 'campus_tech', companyName: 'Campus Tech Repair', category: 'SERVICE_PROVIDER' as any, email: 'fix@campustech.com', password: defaultPassword, phone: '08090123456', schoolId: futminna.id },
  ];

  const createdAgents = [];
  for (const agent of [...agentsData, ...vendorsData, ...serviceProvidersData]) {
    const created = await prisma.agent.create({ data: agent });
    createdAgents.push(created);
  }

  // 5. Create Items for Agents (10 each)
  console.log('Creating items for agents...');
  for (const agent of createdAgents) {
    const items = [];
    if (agent.category === 'AGENT') {
      for (let i = 1; i <= 10; i++) {
        items.push({
          propertyId: `PROP-${agent.id.substring(agent.id.length - 4)}-${i}`,
          name: `Property ${i} by ${agent.companyName}`,
          address: `Address ${i} near ${agent.schoolId}`,
          roomType: i % 2 === 0 ? '1 Bedroom' : 'Self Con',
          amenities: ['Water', 'Electricity'],
          description: `A lovely property for students.`,
          price: 150000 + (i * 10000),
          unitQuantity: i % 3 === 0 ? 1 : 2,
          location: { lat: 6.5, lng: 3.3 },
          agentId: agent.id,
          schoolId: agent.schoolId,
          isVacant: true,
          status: 'available'
        });
      }
      await prisma.property.createMany({ data: items });
    } else if (agent.category === 'VENDOR') {
      for (let i = 1; i <= 10; i++) {
        items.push({
          productId: `PROD-${agent.id.substring(agent.id.length - 4)}-${i}`,
          name: `Product ${i} by ${agent.companyName}`,
          businessCategory: 'Retail',
          description: `Great product for campus life.`,
          price: 5000 + (i * 1000),
          agentId: agent.id,
          schoolId: agent.schoolId,
          isAvailable: true,
          status: 'available',
          delivery: { option: 'CAMPUS', price: 500, duration: 1 }
        });
      }
      await prisma.product.createMany({ data: items });
    } else if (agent.category === 'SERVICE_PROVIDER') {
      for (let i = 1; i <= 10; i++) {
        items.push({
          serviceId: `SRV-${agent.id.substring(agent.id.length - 4)}-${i}`,
          name: `Service ${i} by ${agent.companyName}`,
          address: `Campus Service Point ${i}`,
          serviceCategory: 'Maintenance',
          availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          description: `Reliable service for students.`,
          price: 2000 + (i * 500),
          perUnit: 'Hour',
          time: { startTime: '09:00', endTime: '17:00' },
          agentId: agent.id,
          schoolId: agent.schoolId,
          isAvailable: true,
          status: 'available'
        });
      }
      await prisma.service.createMany({ data: items });
    }
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
