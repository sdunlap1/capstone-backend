CREATE TABLE "Users" (
    "user_id" SERIAL PRIMARY KEY,
    "username" varchar(255) NOT NULL,
    "password" varchar(255) NOT NULL
);

CREATE TABLE "Projects" (
    "project_id" SERIAL PRIMARY KEY,
    "name" varchar(255) NOT NULL,
    "user_id" int NOT NULL,
    CONSTRAINT "fk_Projects_user_id" FOREIGN KEY("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE
);

CREATE TABLE "Tasks" (
    "task_id" SERIAL PRIMARY KEY,
    "title" varchar(255) NOT NULL,
    "due_date" date NOT NULL,
    "completed" boolean NOT NULL,
    "user_id" int NOT NULL,
    "project_id" int NOT NULL,
    CONSTRAINT "fk_Tasks_user_id" FOREIGN KEY("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE,
    CONSTRAINT "fk_Tasks_project_id" FOREIGN KEY("project_id") REFERENCES "Projects"("project_id") ON DELETE CASCADE
);
