#!/usr/bin/env node

'use strict';

import { execSync } from 'child_process';
const { DATABASE_URL_MIGRATE } = process.env;

try {
  // Run the migrate with database connection not using pooling
  // See: https://github.com/prisma/prisma/issues/4752
  execSync(`DATABASE_URL=${DATABASE_URL_MIGRATE} yarn prisma migrate deploy`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
