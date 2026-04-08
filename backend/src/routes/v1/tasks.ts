import { Router } from "express";
import { pool } from "../../db";
import { authMiddleware } from "../middleware";
import { getStatusByTags } from "../../services/statusService";
import { getPriorityByTags } from "../../services/priorityService";
import crypto from "crypto";
import { stat } from "fs";

const router = Router();

const isMyTask = async (userId: any, taskId: any) => {
    try {
        /** Verify the user own the task */
        const query = `SELECT tsk.id  FROM 
            tb_tsk_tr_tasks tsk 
            INNER JOIN tb_tsk_tr_projects prj ON tsk.project_id = prj.id 
            WHERE user_id = $1 AND tsk.id = $2`;
        const task = await pool.query(query, [userId, taskId]);
        if(task.rowCount) return true;
        else return false;
    } catch (error) {
        console.error(error);
        return false;
    }
};

router.get("/", authMiddleware, async (req, res) => {
    const userId = "userId" in req ? req.userId : null;
    try {
        const query = `SELECT
                prj."name" as project_name,
                tsk.id,
                title,
                description,
                sts.status,
                pty.priority,
                due_date,
                tsk.created_at
            FROM
                tb_tsk_tr_tasks tsk
            INNER JOIN tb_tsk_tr_projects prj ON tsk.project_id = prj.id
            LEFT JOIN tb_tsk_rf_statuses sts ON tsk.status = sts.id
            LEFT JOIN tb_tsk_rf_priority pty ON tsk.priority = pty.id
            where
                user_id = $1`;
        
        const tasks = await pool.query(query, [userId]);
        
        res.json({
            data: tasks.rows,
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
        /** Get the tasks */
        const query_task = `SELECT
                prj.name AS project_name,
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
            AND tsk.id = $2
            ORDER BY
                due_date DESC`
        const tasks = await pool.query(query_task, [userId, id]);
        let result: any = {}
        if(tasks.rowCount){ 
            result = tasks.rows[0];
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
    let { project_id, title, description, status, priority, due_date } = req.body;
    
    try {
        /** Verify the user own the project */
        const query = `SELECT id FROM tb_tsk_tr_projects WHERE user_id = $1 AND id = $2`;
        const projects = await pool.query(query, [userId, project_id]);
        
        if(projects.rowCount){
            status = status == null ? await getStatusByTags("[default-if-null]") : status;
            priority = priority == null ? await getPriorityByTags("[default-if-null]") : priority;

            const query_insert = `INSERT INTO tb_tsk_tr_tasks (title, description, status, priority, due_date, project_id, created_at) 
                VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`;
            const task = await pool.query(query_insert, [title, description, status, priority, due_date, project_id]);

            res.json({
                data: {id: task.rows[0].id},
                status: 200,
                message: "ok",
            });
        } else {
            res.json({
                data: null,
                status: 406,
                message: "406 Not Acceptable, invalid project",
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
    let { project_id, title, description, status, priority, due_date } = req.body;
    const { id } = req.params;
    
    try {
        /** Verify the user own the task */
        if(await isMyTask(userId, id)){
            const project = await pool.query(`UPDATE tb_tsk_tr_tasks SET
                title = $1,
                description = $2,
                status = $3,
                priority = $4,
                due_date = $5,
                project_id = $6,
                modified_at = NOW()
                WHERE
                    id = $7`,
                [title, description, status, priority, due_date, project_id, id]
            );
            
            res.json({
                data: {id: id},
                status: 200,
                message: "ok",
            });
        } else {
            res.json({
                data: null,
                status: 406,
                message: "406 Not Acceptable, task not found",
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

router.put("/update_status/:id", authMiddleware, async (req, res) => {
    const userId = "userId" in req ? req.userId : null;
    let { status } = req.body;
    const { id } = req.params;
    
    try {
        /** Verify the user own the task */
        if(await isMyTask(userId, id)){
            const project = await pool.query(`UPDATE tb_tsk_tr_tasks SET
                status = $1,
                modified_at = NOW()
                WHERE
                    id = $2`,
                [status, id]
            );
            
            res.json({
                data: {id: id},
                status: 200,
                message: "ok",
            });
        } else {
            res.json({
                data: null,
                status: 406,
                message: "406 Not Acceptable, task not found",
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
        if(await isMyTask(userId, id)){
            const project = await pool.query(`DELETE FROM tb_tsk_tr_tasks WHERE id = $1`,
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
                message: "406 Not Acceptable, task not found",
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