import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const jwtConstants = {
  secret: process.env.SECRET_KEY,
};