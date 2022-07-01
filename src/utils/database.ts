import { createConnection as createDatabaseConnection } from 'mysql2';

export class Database {
  static instance = null;

  static getInstance() {
    if (Database.instance == null) {
      Database.instance = createDatabaseConnection({
        host: process.env.MYSQL_HOSTNAME,
        database: process.env.MYSQL_DATABASE,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
      });
    } else {
      return Database.instance;
    }
  }

  static promisedQuery(query: string, parameters?: any[]) {
    return new Promise((resolve, reject) => {
      Database.getInstance().query(query, parameters, (_, results) =>
        results ? resolve(results) : reject(),
      );
    });
  }
}

export class RadiusDatabase {
  static instance = null;

  static getInstance() {
    if (RadiusDatabase.instance == null) {
      RadiusDatabase.instance = createDatabaseConnection({
        host: process.env.RADIUS_SQL_HOSTNAME,
        database: process.env.RADIUS_SQL_DATABASE,
        user: process.env.RADIUS_SQL_USER,
        password: process.env.RADIUS_SQL_PASSWORD,
      });
    } else {
      return RadiusDatabase.instance;
    }
  }

  static promisedQuery(query: string, parameters?: any[]) {
    return new Promise((resolve, reject) => {
      RadiusDatabase.getInstance().query(query, parameters, (_, results) =>
        results ? resolve(results) : reject(),
      );
    });
  }
}
