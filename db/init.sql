CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tb_tsk_rf_users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwd TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS tb_tsk_rf_statuses (
    id SERIAL PRIMARY KEY,
    status TEXT NOT NULL,
    tags TEXT DEFAULT NULL,
    sort_order INTEGER DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS tb_tsk_rf_priority (
    id SERIAL PRIMARY KEY,
    priority TEXT NOT NULL,
    tags TEXT DEFAULT NULL,
    sort_order INTEGER DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS tb_tsk_tr_projects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    user_id INTEGER REFERENCES tb_tsk_rf_users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS tb_tsk_tr_tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status INTEGER DEFAULT NULL REFERENCES tb_tsk_rf_statuses(id) ON DELETE SET NULL,
    priority INTEGER DEFAULT NULL REFERENCES tb_tsk_rf_priority(id) ON DELETE SET NULL,
    due_date TIMESTAMP,
    project_id INTEGER REFERENCES tb_tsk_tr_projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS tb_tsk_tr_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES tb_tsk_rf_users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tb_tsk_tr_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tb_tsk_tr_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tb_tsk_tr_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON tb_tsk_tr_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON tb_tsk_tr_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON tb_tsk_tr_sessions(token);

INSERT INTO public.tb_tsk_rf_priority (id, priority, tags, sort_order, created_at, modified_at) VALUES
(1, 'Low', NULL, 100, NOW(), NULL),
(2, 'Medium', '[default-if-null]', 200, NOW(), NULL),
(3, 'High', NULL, 300, NOW(), NULL);

INSERT INTO public.tb_tsk_rf_statuses (id, status, tags, sort_order, created_at, modified_at) VALUES
(1, 'Todo', '[default-if-null]', 100, NOW(), NULL),
(2, 'In Progress', NULL, 200, NOW(), NULL),
(3, 'Done', NULL, 300, NOW(), NULL);

INSERT INTO public.tb_tsk_rf_users (id, full_name, email, passwd, created_at, modified_at) VALUES
(1, 'Ahmad Rianto', 'adrian.ahmadrianto@gmail.com', '$2a$06$F8xek03ewvXI8BUm5PZLq.ytDJzPxl3MzLWbyMkhd3WvQf4/UICB2', NOW(), NULL),
(2, 'England Sloan', 'ligula@protonmail.com', '$2a$06$F8xek03ewvXI8BUm5PZLq.ytDJzPxl3MzLWbyMkhd3WvQf4/UICB2', NOW(), NULL);