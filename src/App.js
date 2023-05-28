import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';

import TodoDetails from './TodoDetails';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCjYUIQtIGx5osC9vgNkIFz3v-iLqsI9PQ',
  authDomain: 'notes-242c0.firebaseapp.com',
  databaseURL: 'https://notes-242c0-default-rtdb.firebaseio.com',
  projectId: 'notes-242c0',
  storageBucket: 'notes-242c0.appspot.com',
  messagingSenderId: '378520659218',
  appId: '1:378520659218:web:6b991fbc66d4f1c0f43fcb',
};
//firebase.initializeApp(firebaseConfig);

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatedTodo, setUpdatedTodo] = useState('');
  const [likes, setLikes] = useState({});
  const [dislikes, setDislikes] = useState({});
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    // Fetch initial todos from the database

    const todosRef = database.ref('todos');
    todosRef.on('value', (snapshot) => {
      const todoData = snapshot.val();
      const todoList = todoData ? Object.values(todoData) : [];
      setTodos(todoList);
    });

    return () => {
      // Unsubscribe from the todos ref when component unmounts
      todosRef.off('value');
    };
  }, []);

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    const todoRef = database.ref('todos').push();
    todoRef.set({
      id: todoRef.key,
      title: newTodo,
      description: newDescription,
      image: newImage, // Include the newImage value
      completed: false,
      likes: 0,
      dislikes: 0,
    });
    setNewTodo('');
    setNewDescription('');
    setNewImage('');
  };

  const likeTodo = (id) => {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [id]: (prevLikes[id] || 0) + 1,
    }));
  };

  const dislikeTodo = (id) => {
    setDislikes((prevDislikes) => ({
      ...prevDislikes,
      [id]: (prevDislikes[id] || 0) + 1,
    }));
  };

  const updateTodo = (id, completed) => {
    const todoRef = database.ref(`todos/${id}`);
    todoRef.update({
      completed: completed,
      likes: completed ? likes[id] || 0 : 0, // Set likes to existing value or 0 if not set
      dislikes: completed ? dislikes[id] || 0 : 0, // Set dislikes to existing value or 0 if not set
    });
  };

  const updateTodoName = (id, newName) => {
    const todoRef = database.ref(`todos/${id}`);
    todoRef.update({
      title: newName,
    });
  };

  const deleteTodo = (id) => {
    const todoRef = database.ref(`todos/${id}`);
    todoRef.remove();
  };

  const filterTodos = (todos) => {
    return todos.filter((todo) =>
      todo.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredTodos = filterTodos(todos);

  const handleUpdate = (id) => {
    updateTodoName(id, updatedTodo);
    setUpdatedTodo('ff');
  };
  const TodoList = ({ todos }) => {
    const location = useLocation();
  };

  return (
    <Router>
      <div>
        <h1>Todo App</h1>
        <input
          type="text"
          placeholder="New Todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <button onClick={addTodo}>Add Todo</button>
        <input
          type="text"
          placeholder="Search Todos"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <ul>
          <Routes>
            <Route path="/" element={<TodoList todos={filteredTodos} />} />
            <Route path="/todos/:id" element={<TodoDetails todos={todos} />} />
          </Routes>
          {filteredTodos.map((todo) => (
            <li key={todo.id}>
              <Link to={`/todos/${todo.id}`}>{todo.title}</Link>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => updateTodo(todo.id, e.target.checked)}
              />
              <input
                type="text"
                onChange={(e) => setUpdatedTodo(e.target.value)}
              />
              <p>{todo.description}</p>

              <button onClick={() => handleUpdate(todo.id)}>Update</button>
              <button onClick={() => deleteTodo(todo.id)}>Delete</button>
              <br />
              <button onClick={() => likeTodo(todo.id)}>Like</button>
              <button onClick={() => dislikeTodo(todo.id)}>Dislike</button>
              <p>Likes: {likes[todo.id] || 0}</p>
              <p>Dislikes: {dislikes[todo.id] || 0}</p>
            </li>
          ))}
        </ul>
      </div>
    </Router>
  );
}

export default App;
