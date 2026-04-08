import express from "express";
import cors from "cors";
import v1StatusesRoutes from "./routes/v1/statuses";
import v1PrioritiesRoutes from "./routes/v1/priorities";
import v1UsersRoutes from "./routes/v1/users";
import v1AuthRoutes from "./routes/v1/auth";
import v1ProjectsRoutes from "./routes/v1/projects";
import v1TasksRoutes from "./routes/v1/tasks";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/v1/statuses", v1StatusesRoutes);
app.use("/v1/priorities", v1PrioritiesRoutes);
app.use("/v1/users", v1UsersRoutes);
app.use("/v1/auth", v1AuthRoutes);
app.use("/v1/projects", v1ProjectsRoutes);
app.use("/v1/tasks", v1TasksRoutes);

app.get("/", (_, res) => {
    res.send("API is running 🚀");
});

export default app;