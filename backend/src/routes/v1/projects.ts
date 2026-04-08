import { Router } from "express";
import { pool } from "../../db";
import { authMiddleware } from "../middleware";
import crypto from "crypto";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
    const userId = "userId" in req ? req.userId : null;
    try {
        const query = `SELECT
                    prj.id,
                    name,
                    count(tsk.id) as task_count
                FROM
                    tb_tsk_tr_projects prj
                LEFT JOIN tb_tsk_tr_tasks tsk ON prj.id = tsk.project_id
                WHERE
                    prj.user_id = $1
                GROUP BY
                    prj.id`;
        
        const projects = await pool.query(query, [userId]);
        
        res.json({
            data: projects.rows,
            status: 200,
            message: "ok",
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

router.get("/:id", authMiddleware, async (req, res) => {
    const userId = "userId" in req ? req.userId : null;
    const { id } = req.params
    try {
        /** Get the project */
        const query = `SELECT
                    prj.id,
                    name,
                    count(tsk.id) as task_count
                FROM
                    tb_tsk_tr_projects prj
                LEFT JOIN tb_tsk_tr_tasks tsk ON prj.id = tsk.project_id
                WHERE
                    prj.user_id = $1
                AND prj.id = $2
                GROUP BY
                    prj.id`;
        
        const projects = await pool.query(query, [userId, id]);
        
        let result: any = {};
        if(projects.rowCount){
            /** Get the tasks */
            const query_task = `SELECT
                    tsk.id,
                    title,
                    description,
                    sts.status,
                    pty.priority,
                    due_date,
                    tsk.created_at
                FROM
                    tb_tsk_tr_tasks tsk
                INNER JOIN tb_tsk_tr_projects prj on tsk.project_id = prj.id
                LEFT JOIN tb_tsk_rf_statuses sts on tsk.status = sts.id
                LEFT JOIN tb_tsk_rf_priority pty on tsk.priority = pty.id
                WHERE
                    user_id = $1
                AND tsk.project_id = $2
                ORDER BY
                    due_date DESC`
            const tasks = await pool.query(query_task, [userId, id]);

            result = projects.rows[0];
            result["tasks"] = tasks.rows;
        }
        
        res.json({
            data: result,
            status: 200,
            message: "ok",
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

router.put("/add", authMiddleware, async (req, res) => {
    const userId = "userId" in req ? req.userId : null;
    const { name } = req.body;
    
    try {
        const query = `SELECT id FROM tb_tsk_tr_projects WHERE user_id = $1 AND name = $2`;
        const projects = await pool.query(query, [userId, name]);

        if(projects.rowCount == 0){
            const project = await pool.query(`INSERT INTO tb_tsk_tr_projects (name, user_id) VALUES ($1, $2) RETURNING id`,
                [name, userId]
            );

            res.json({
                data: {project_id: project.rows[0].id},
                status: 200,
                message: "ok",
            });
        } else {
            res.json({
                data: null,
                status: 406,
                message: "406 Not Acceptable, Project with name " + name + " already exist",
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

router.put("/update/:id", authMiddleware, async (req, res) => {
    const userId = "userId" in req ? req.userId : null;
    const { name } = req.body;
    const { id } = req.params;
    
    try {
        const query = `SELECT id FROM tb_tsk_tr_projects WHERE user_id = $1 AND id = $2`;
        const projects = await pool.query(query, [userId, id]);

        if(projects.rowCount){
            const project = await pool.query(`UPDATE tb_tsk_tr_projects SET
                name = $1,
                modified_at = NOW()
                WHERE
                    id = $2`,
                [name, id]
            );
            
            res.json({
                data: {project_id: id},
                status: 200,
                message: "ok",
            });
        } else {
            res.json({
                data: null,
                status: 406,
                message: "406 Not Acceptable, Project not found",
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

router.delete("/delete/:id", authMiddleware, async (req, res) => {
    const userId = "userId" in req ? req.userId : null;
    const { id } = req.params;
    
    try {
        const query = `SELECT id FROM tb_tsk_tr_projects WHERE user_id = $1 AND id = $2`;
        const projects = await pool.query(query, [userId, id]);

        if(projects.rowCount){
            const project = await pool.query(`DELETE FROM tb_tsk_tr_projects WHERE id = $1`,
                [id]
            );
            
            res.json({
                data: {project_id: id},
                status: 200,
                message: "ok",
            });
        } else {
            res.json({
                data: null,
                status: 406,
                message: "406 Not Acceptable, Project not found",
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

export default router;