import { Request, Response, NextFunction } from "express";
import { pool } from "../db";

export const authMiddleware = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "No token" });
        }

        const result = await pool.query(`SELECT id, user_id FROM tb_tsk_tr_sessions WHERE token = $1 AND expires_at > NOW()`,
            [token]
        );

        const session = result.rows[0];

        if (!session) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        req.userId = session.user_id;

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Auth error" });
    }
};