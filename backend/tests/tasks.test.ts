import request from "supertest";
import app from "../src/app";

let token: string;

beforeAll(async () => {
    const res = await request(app)
        .post("/v1/auth")
        .send({
            email: "adrian.ahmadrianto@gmail.com",
            password: "mypassword",
        });
    token = res.body.data.token;
});

test("POST /projects", async () => {
    const res = await request(app)
        .get("/v1/projects")
        .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
});

test("POST /tasks", async () => {
    const res = await request(app)
        .get("/v1/tasks")
        .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
});

test("POST /statuses", async () => {
    const res = await request(app)
        .get("/v1/statuses")
        .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
});

test("POST /priorities", async () => {
    const res = await request(app)
        .get("/v1/priorities")
        .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
});