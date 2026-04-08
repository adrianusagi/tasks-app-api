import { Router } from "express";
import { pool } from "../../db";
import { authMiddleware } from "../middleware";
import crypto from "crypto";

const router = Router();

const generateToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

router.post("/", async (req, res) => {
    const { email } = req.body;
    const { password } = req.body;

    try {
        const isAuth = await pool.query("SELECT id FROM tb_tsk_rf_users WHERE email = $1 AND crypt($2, passwd) = passwd", [email, password]);
        
        if(isAuth.rowCount == 1){
            const token = generateToken();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

            await pool.query(`INSERT INTO tb_tsk_tr_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)`,
                [isAuth.rows[0].id, token, expiresAt]
            );

            res.json({
                data: {token: token},
                status: 200,
                message: "ok",
            });
        } else {
            res.json({
                data: null,
                status: 401,
                message: "401 Unauthorized",
            });
        }
    } catch (error) {
        console.error(error);

        res.status(500).json({
            data: null,
            status: 500,
            message: "Internal Server Error",
        });
    }
});

router.post("/logout", authMiddleware, async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    await pool.query("DELETE FROM tb_tsk_tr_sessions WHERE token = $1",
        [token]
    );

    res.json({ message: "Logged out" });
});

export default router;