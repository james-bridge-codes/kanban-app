// temporary script to create test user
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

async function createTestUser() {
  const hashedPassword = await bcrypt.hash("test123", 10);

  try {
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        password: hashedPassword,
        name: "Test User",
      },
    });
    console.log("Test user created:", user);
  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
