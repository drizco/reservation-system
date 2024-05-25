import * as dotenv from 'dotenv';

process.env.NODE_ENV = 'test';

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });
