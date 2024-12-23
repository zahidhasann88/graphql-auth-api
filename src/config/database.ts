import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "admin123",
  database: "graphql_db",
  synchronize: true,
  logging: true,
  entities: ["src/entities/**/*.ts"],
  subscribers: [],
  migrations: [],
});
