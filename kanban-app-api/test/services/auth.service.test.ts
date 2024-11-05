import { describe, it, expect, beforeAll, afterAll } from "vitest";
import jwt from "jsonwebtoken";
import { createToken } from "../../src/services/authService";

describe("Auth Service - createToken", () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const TEST_JWT_SECRET = "test-secret-key";

  beforeAll(() => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  it("should create a valid JWT token containing userId", () => {
    const userId = "123";
    const token = createToken(userId);

    const decoded = jwt.verify(token, TEST_JWT_SECRET) as { id: string };
    expect(decoded).toBeDefined();
    expect(decoded.id).toBe(userId);
  });

  it("should create different tokens for different userIds", () => {
    const token1 = createToken("123");
    const token2 = createToken("456");

    expect(token1).not.toBe(token2);

    const decoded1 = jwt.verify(token1, TEST_JWT_SECRET) as { id: string };
    const decoded2 = jwt.verify(token2, TEST_JWT_SECRET) as { id: string };

    expect(decoded1.id).toBe("123");
    expect(decoded2.id).toBe("456");
  });

  it("should create valid token for numeric userId", () => {
    const numericUserId = "12345";
    const token = createToken(numericUserId);

    const decoded = jwt.verify(token, TEST_JWT_SECRET) as { id: string };
    expect(decoded.id).toBe(numericUserId);
  });

  it("should handle long userIds", () => {
    const longUserId = "very-long-user-id-123456789";
    const token = createToken(longUserId);

    const decoded = jwt.verify(token, TEST_JWT_SECRET) as { id: string };
    expect(decoded.id).toBe(longUserId);
  });
});
