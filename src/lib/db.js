import mysql from "mysql2/promise";

const isProduction = process.env.NODE_ENV === "production";

const pool = mysql.createPool({
    host: isProduction ? process.env.MYSQL_HOST : "localhost",
    user: isProduction ? process.env.MYSQL_USER : "ivan",
    password: isProduction ? process.env.MYSQL_PASSWORD : "ivan12345",
    database: isProduction ? process.env.MYSQL_DATABASE : "fsy2025",
    port: isProduction ? process.env.MYSQL_PORT : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export async function query(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);

        // ✅ Ensure we always return an array
        if (!Array.isArray(results)) {
            throw new Error("Database query did not return an array");
        }

        return results;
    } catch (error) {
        console.error("Database query error:", error);
        return []; // ✅ Return an empty array to prevent `map` errors
    }
}

export default pool;
