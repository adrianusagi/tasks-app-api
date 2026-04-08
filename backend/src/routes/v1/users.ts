import { Router } from "express";
import { pool } from "../../db";

const router = Router();

router.get("/", async (_, res) => {
    try {
        const result = await pool.query("SELECT id, full_name, email FROM tb_tsk_rf_users");

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

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("SELECT id, full_name, email FROM tb_tsk_rf_users WHERE id = $1",[id]);

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