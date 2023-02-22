const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { response } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find((user) => user.username === username)
  
  if(!user || typeof user === 'undefined'){
    return response.status(404).json({ error: "User not found!"})
  }

  request.user = user

  return next()
}

function checksUserAlreadyExists(request, response, next){
  const { username } = request.body

  if (typeof username === 'undefined') {
    return response.status(400).json({ error: 'Username não definido!'})
  }

  const userAlreadyExists = users.some((user) => user.username === username)

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'Username já existe!'})
  }

  return next()
}

function checksTodoExists(request, response, next) {
  const { id } = request.params

  const user = request.user
  const todo = user.todos.find((todo) => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: 'Tarefa não encontrada!'})
  }

  request.user.todo = todo

  return next()
}

app.post('/users',checksUserAlreadyExists, (request, response) => {
  const { name, username } = request.body

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(users)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { username } = request.headers

  const user = users.find(user => user.username = username)

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, checksTodoExists, (request, response) => {
  const { title, deadline } = request.body
  const { todo } = request.user

  todo.title = title
  todo.deadline = deadline


  return response.status(202).send()
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksTodoExists, (request, response) => {
  const { todo } = request.user
  
  todo.done = true

  return response.status(202).send()
});

app.delete('/todos/:id', checksExistsUserAccount, checksTodoExists, (request, response) => {
  const { id } = request.params
  const user = request.user

  const todoIndex = user.todos.findIndex((todo) => todo.id === id)

  user.todos.splice(todoIndex, 1)

  return response.status(204).send()
});

module.exports = app;
