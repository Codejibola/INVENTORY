import dotenv from 'dotenv';
dotenv.config();

export const LOCAL_ENV = {
DATABASE_URL: process.env.DATABASE_URL,
JWT_SECRET: process.env.JWT_SECRET ,
PORT: process.env.PORT || 5000,
DB_USER: process.env.DB_USER ,
DB_PASSWORD: process.env.DB_PASSWORD,
DB_HOST: process.env.DB_HOST,
DB_PORT: process.env.DB_PORT,
DB_NAME: process.env.DB_NAME ,
EMAIL_USER: process.env.EMAIL_USER,
EMAIL_PASS: process.env.EMAIL_PASS ,
FRONTEND_URL: process.env.FRONTEND_URL,
PAYSTACK_SECRET_KEY : process.env.PAYSTACK_SECRET_KEY,
PAYSTACK_PUBLIC_KEY : process.env.PAYSTACK_PUBLIC_KEY

};

