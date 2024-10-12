const request = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');
const { Task, sequelize, User, Category } = require('../models');  // Import Category
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/config');

let validToken;
let categoryId;

describe("Task Routes", () => {
  beforeAll(async () => {
    // Sync the test database and create a user
    await sequelize.sync({ force: true });  // Force recreation of tables

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create a test user to generate a valid token
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@test.com',
      password: hashedPassword  // Store the hashed password
    });

    // Create a category and capture its category_id
    const category = await Category.create({
      name: 'General',
    });
    categoryId = category.category_id;  // Store the generated category_id

    // Generate JWT token for the user
    validToken = jwt.sign({ user_id: testUser.user_id, username: testUser.username }, SECRET_KEY, { expiresIn: '1h' });
  });

  afterAll(async () => {
    // Clean up the database and close the connection
    await sequelize.close();
  });

  describe("GET /tasks", () => {
    test("It should return tasks for the authenticated user", async () => {
      const res = await request(app)
        .get("/tasks")
        .set('Authorization', `Bearer ${validToken}`)  // Use the generated valid token
        .expect(200);

      expect(res.body.tasks).toBeDefined();
      expect(res.body.currentPage).toBe(1);
    });

    test("It should return unauthorized without token", async () => {
      const res = await request(app)
        .get("/tasks")
        .expect(401);

      expect(res.body.message).toBe("Unauthorized");
    });
  });

  describe("POST /tasks", () => {
    test("It should create a task with valid data", async () => {
      const taskData = {
        title: "Finish the project",
        due_date: "2024-10-15",
        completed: false,
        category_id: categoryId,  // Use dynamic category_id
      };

      const res = await request(app)
        .post("/tasks")
        .set('Authorization', `Bearer ${validToken}`)  // Add valid token
        .send(taskData)
        .expect(201);  // Expect 201 status code for successful creation

      expect(res.body.task).toBeDefined();
      expect(res.body.task.title).toBe("Finish the project");
    });

    test("It should return validation error when title is missing", async () => {
      const taskData = {
        due_date: "2024-10-15",
        completed: false,
        category_id: categoryId,  // Use dynamic category_id
      };

      const res = await request(app)
        .post("/tasks")
        .set('Authorization', `Bearer ${validToken}`)
        .send(taskData)
        .expect(400);  // Expect validation error

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].msg).toBe("Title is required");
    });

    test("It should create a task without optional fields", async () => {
      const taskData = {
        title: "Optional fields test",
      };

      const res = await request(app)
        .post("/tasks")
        .set('Authorization', `Bearer ${validToken}`)
        .send(taskData)
        .expect(201);  // Expect 201 for successful creation

      expect(res.body.task).toBeDefined();
      expect(res.body.task.due_date).toBeNull();  // Expect null for due_date
      expect(res.body.task.completed).toBe(false);  // Expect false for completed
    });
  });
});
