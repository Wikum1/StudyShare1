
const request = require("supertest");
const app = require("../../app"); // make sure app.js exports express app

describe("Admin Resource Moderation API", () => {

  it("should block non-admin access", async () => {
    const res = await request(app)
      .get("/api/admin/resources")
      .set("Authorization", "Bearer faketoken");

    expect(res.statusCode).toBe(403);
  });

});
