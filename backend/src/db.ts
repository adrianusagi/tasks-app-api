import { Pool } from "pg";

export const pool = new Pool({
    user: "postgres",
    host: "task_db",
    database: "task_app",
    password: "postgres",
    port: 5432,
});