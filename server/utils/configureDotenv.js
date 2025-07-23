import dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point dotenv to the correct .env path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });