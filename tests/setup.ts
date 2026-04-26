import dotenv from 'dotenv';
import path from 'path';

// Load .env.test — this runs before every test file
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });