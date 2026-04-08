import { pool } from "../db";

export const getPriorityByTags = async (tags: string) => {
    try {
        const result = await pool.query("SELECT id FROM tb_tsk_rf_priority WHERE tags LIKE $1", ["%"+tags+"%"]);

        if(result.rowCount) return result.rows[0].id;
        else return false;
    } catch (error) {
        console.error(error);

        return false;
    }
}