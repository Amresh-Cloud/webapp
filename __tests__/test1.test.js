const request = require("supertest");
const express = require("express");
const app = require("../app");
const sequelize = require("../DatabaseConnection/connection");

const mysql = require("mysql2/promise");
require("dotenv").config();

describe("User API Integration Tests", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Sync models with the database
  });

  afterAll(async () => {
    await sequelize.close();
  });
  afterEach(async () => {
    // Removing Test User
    console.log("Deleting the User after Test");
    await sequelize.models.User.destroy({ where: {} });
  });

  it("Test 1 - Create Account and Get User", async () => {
    const response = await request(app).post("/v1/user").send({
      first_name: "Rajiv",
      last_name: "Singh",
      password: "Pass@123",
      username: "rajiv@gmail.com",
    });
   
    expect(response.status).toBe(201);

    const getCreatedUser = await request(app)
      .get("/v1/user/self")
      .set(
        "Authorization",
        `Basic ${Buffer.from("rajiv@gmail.com:Pass@123").toString("base64")}`
      );

    expect(getCreatedUser.status).toBe(200);
  });

  it("Test 2 - Create Account and Validate using Get Call", async () => {
    const response = await request(app).post("/v1/user").send({
      first_name: "Sourav",
      last_name: "Singh",
      password: "Pass@1234",
      username: "sourav@gmail.com",
    });
  
    expect(response.status).toBe(201);

    const update = await request(app)
      .put("/v1/user/self")
      .set(
        "Authorization",
        `Basic ${Buffer.from("sourav@gmail.com:Pass@1234").toString("base64")}`
      )
      .send({
        first_name: "Souravvv",
        last_name: "Singhhh",
        password: "Pass@12345",
      });

    expect(update.status).toBe(204);
    const getUpdated = await request(app)
      .get("/v1/user/self")
      .set(
        "Authorization",
        `Basic ${Buffer.from("sourav@gmail.com:Pass@12345").toString("base64")}`
      );

    expect(getUpdated.status).toBe(200);
  });
});
