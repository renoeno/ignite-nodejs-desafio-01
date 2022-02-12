const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "Usuário não encontrado." });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const user = users.find((user) => user.username === username);

  if (user) {
    return response.status(400).json({ error: "Usuário já existe" });
  }

  const id = uuidv4();

  const newUser = { id, name, username, todos: [] };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const userIndex = users.findIndex((user) => user.username === username);

  const todos = users[userIndex].todos;

  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  const id = uuidv4();

  const todo = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo não existe" });
  }

  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = deadline;

  return response.status(200).json(user.todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo não existe" });
  }

  user.todos[todoIndex].done = true;

  return response.status(200).json(user.todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo não existe" });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).end();
});

module.exports = app;
