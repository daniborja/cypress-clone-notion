import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './../../../migrations/schema';

dotenv.config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  console.log('🔴 Cannot find database url');
}

const client = postgres(process.env.DATABASE_URL as string, { max: 1 });
const db = drizzle(client, { schema });

// like  .ddl-auto=update
// const migrateDb = async () => {
//   try {
//     console.log('🟠 Migrating client');
//     await migrate(db, { migrationsFolder: 'migrations' });
//     console.log('🟢 Successfully Migrated');
//   } catch (error) {
//     console.log('🔴 Error Migrating client', error);
//   }
// };
// migrateDb();

export default db;
