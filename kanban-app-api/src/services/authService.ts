import jwt from "jsonwebtoken";

export const validateUser = (email: string, password: string) => {};

export const createToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!);
};
