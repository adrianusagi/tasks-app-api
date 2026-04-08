import { Router } from "express";
import { pool } from "../../db";

const router = Router();

router.get("/", async (_, res) => {
    try {
        const result = await pool.query("SELECT id, priority, tags FROM tb_tsk_rf_priority ORDER BY sort_order");

        res.json({
            data: result.rows,
            status: 200,
            message: "OK",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            data: null,
            status: 500,
            message: "Internal Server Error",
        });
    }
});

export default router;