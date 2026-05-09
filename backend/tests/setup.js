const dotenv = require('dotenv');
const path = require('path');

// This forces it to look at your specific .env.test file regardless of where you run tests from
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });