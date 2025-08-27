import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Todo {
  id?: number;
  text: string;
  status: 'pending' | 'completed' | 'rejected';
  created_at?: Date;
  showStatus?: boolean;              // Dropdown toggle
  activeDropdownStatus?: 'pending' | 'completed' | 'rejected'; // Temp for dropdown display
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  todos: Todo[] = [];
  newTodo: string = '';
  private API_URL = 'http://localhost:3000/todos';

  statuses: ('pending' | 'completed' | 'rejected')[] = ['pending', 'completed', 'rejected'];

  constructor(private http: HttpClient) { 
    this.loadTodos(); 
  }

  // Load todos from backend
  loadTodos() {
    this.http.get<Todo[]>(this.API_URL)
      .subscribe(data => {
        this.todos = data.map(todo => ({ ...todo, showStatus: false, activeDropdownStatus: todo.status }));
      });
  }

  // Add new todo
  addTodo() {
    if (!this.newTodo.trim()) return;

    const payload: Todo = {
      text: this.newTodo,
      status: 'pending',
      created_at: new Date()
    };

    this.http.post<Todo>(this.API_URL, payload)
      .subscribe(todo => {
        this.todos.push({ ...todo, showStatus: false, activeDropdownStatus: todo.status });
        this.newTodo = '';
      });
  }

  // Update status
  updateStatus(todo: Todo, status: 'pending' | 'completed' | 'rejected') {
    todo.activeDropdownStatus = status; // temp update
    todo.showStatus = false;

    this.http.put<Todo>(`${this.API_URL}/${todo.id}/status`, { status })
      .subscribe(res => {
        const index = this.todos.findIndex(t => t.id === todo.id);
        if (index !== -1) this.todos[index] = { ...res, showStatus: false, activeDropdownStatus: res.status };
      });
  }

  // Toggle dropdown (only for this todo)
  toggleStatusDropdown(todo: Todo) {
    this.todos.forEach(t => {
      if (t !== todo) t.showStatus = false; // close others
    });
    todo.showStatus = !todo.showStatus;
    if (todo.showStatus) {
      todo.activeDropdownStatus = todo.status; // init temp dropdown value
    }
  }

  // Delete todo
  removeTodo(index: number) {
    const todo = this.todos[index];
    this.http.delete(`${this.API_URL}/${todo.id}`)
      .subscribe(() => this.todos.splice(index, 1));
  }

  // Clear all todos
  clearTodos() {
    this.http.delete(this.API_URL)
      .subscribe(() => this.todos = []);
  }
}
