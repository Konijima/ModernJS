import { Service } from '../core/Service.js';
import { Database } from '../utils/db.js';

export class TodoService extends Service {
    constructor() {
        super([]); // Initial state
        this.db = new Database('TodoDB', 1, {
            todos: { keyPath: 'id', autoIncrement: true }
        });
        this.init();
    }

    async init() {
        await this.db.connect();
        const todos = await this.db.getAll('todos');
        this.setState(todos);
    }

    async addTodo(text) {
        const todo = { text, completed: false, createdAt: new Date() };
        const id = await this.db.add('todos', todo);
        // Use immutable state update
        this.setState([...this.state, { ...todo, id }]);
    }

    async toggleTodo(id) {
        const index = this.state.findIndex(t => t.id === id);
        if (index !== -1) {
            // Create new object with toggled state
            const todo = { ...this.state[index], completed: !this.state[index].completed };
            await this.db.put('todos', todo);
            
            // Create new array with updated item
            const newTodos = [
                ...this.state.slice(0, index),
                todo,
                ...this.state.slice(index + 1)
            ];
            this.setState(newTodos);
        }
    }

    async removeTodo(id) {
        await this.db.delete('todos', id);
        this.setState(this.state.filter(t => t.id !== id));
    }
}
