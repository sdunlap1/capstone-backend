const request = require("supertest");
const app = require("../app");
const bcrypt = require("bcrypt");
const { sequelize, User, Project } = require("../models"); // Import models
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");

let validToken;

describe("Projects Routes", () => {
  beforeAll(async () => {
    // Sync the test database and create a user
    await sequelize.authenticate();  // Ensure database connection
    await sequelize.sync({ force: true });  // Force recreate all tables

    // Hash the password
    const hashedPassword = await bcrypt.hash("password123", 12);

    // Create a test user and generate a valid JWT token
    const testUser = await User.create({
      username: "testuser",
      email: "test@test.com",
      password: hashedPassword,
    });

    // Generate JWT token for the user
    validToken = jwt.sign(
      { user_id: testUser.user_id, username: testUser.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    // Close the database connection after all tests
    await sequelize.close();
  });

  test("It should create a project with valid data", async () => {
    const projectData = {
      name: "New Project",
      description: "Project description",
      due_date: "2024-10-15",
    };

    const res = await request(app)
      .post("/projects")
      .set("Authorization", `Bearer ${validToken}`)
      .send(projectData)
      .expect(201);

    expect(res.body.project).toBeDefined();
    expect(res.body.project.name).toBe("New Project");
  });

  test("It should return validation error when project name is missing", async () => {
    const projectData = {
      description: "Project without name",
      due_date: "2024-10-15",
    };

    const res = await request(app)
      .post("/projects")
      .set("Authorization", `Bearer ${validToken}`)
      .send(projectData)
      .expect(400);  // Expecting 400 Bad Request for validation error

    console.log(res.body);  // Log to inspect the error message

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toBe("Project.name cannot be null");
  });
});
