import dotenv from 'dotenv';
dotenv.config();

export const LOCAL_ENV = {
  // .trim() removes any accidental leading/trailing spaces
  // .replace() removes any accidental quotes
  DATABASE_URL: process.env.DATABASE_URL?.trim().replace(/['"]+/g, ''),
  JWT_SECRET: process.env.JWT_SECRET?.trim().replace(/['"]+/g, ''),
  PORT: process.env.PORT || 5000,
  DB_USER: process.env.DB_USER?.trim().replace(/['"]+/g, ''),
  DB_PASSWORD: process.env.DB_PASSWORD?.trim().replace(/['"]+/g, ''),
  DB_HOST: process.env.DB_HOST?.trim().replace(/['"]+/g, ''),
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME?.trim().replace(/['"]+/g, ''),
  EMAIL_USER: process.env.EMAIL_USER?.trim().replace(/['"]+/g, ''),
  EMAIL_PASS: process.env.EMAIL_PASS?.trim().replace(/['"]+/g, ''),
  
  // Clean the URL specifically
  FRONTEND_URL: process.env.FRONTEND_URL?.trim().replace(/['"]+/g, '').replace(/\/$/, ''), 
  
  PAYSTACK_SECRET_KEY : process.env.PAYSTACK_SECRET_KEY?.trim().replace(/['"]+/g, ''),
  PAYSTACK_PUBLIC_KEY : process.env.PAYSTACK_PUBLIC_KEY?.trim().replace(/['"]+/g, '')
};