
const request = require("supertest");
const app = require("../app"); // make sure app.js exports express app

describe("Resource Upload API", () => {

  it("should fail without authentication", async () => {
    const res = await request(app).get("/api/resources/my");
    expect(res.statusCode).toBe(401);
  });

  it("should validate missing file upload", async () => {
    const res = await request(app)
      .post("/api/resources")
      .set("Authorization", "Bearer faketoken")
      .send({
        title: "Test Resource",
        description: "Test Description",
        subject: "IT"
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

});
