import jwt from "jsonwebtoken";

export const createToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!);
};
