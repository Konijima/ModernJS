import { Service } from '../../core/services/service.js';
import { StorageService } from '../../core/services/storage.service.js';

/**
 * Service for managing todo items.
 * Uses IndexedDB for persistence.
 */
export class TodoService extends Service {
    static inject = [StorageService];

    /**
     * Initialize the TodoService.
     * Sets up the database connection and loads initial data.
     * @param {StorageService} storageService
     */
    constructor(storageService) {
        super([]); // Initial state
        this.storageService = storageService;
        this.db = this.storageService.init('TodoDB', 1, {
            todos: { keyPath: 'id', autoIncrement: true }
        });
        this.init();
    }

    /**
     * Initialize the database and load todos.
     * @private
     */
    async init() {
        await this.db.connect();
        const todos = await this.db.getAll('todos');
        this.setState(todos);
    }

    /**
     * Add a new todo item.
     * @param {string} text - The text of the todo item
     */
    async addTodo(text) {
        const todo = { text, completed: false, createdAt: new Date() };
        const id = await this.db.add('todos', todo);
        // Use immutable state update
        this.setState([...this.state, { ...todo, id }]);
    }

    /**
     * Toggle the completed status of a todo item.
     * @param {number} id - The ID of the todo item to toggle
     */
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

    /**
     * Remove a todo item.
     * @param {number} id - The ID of the todo item to remove
     */
    async removeTodo(id) {
        await this.db.delete('todos', id);
        this.setState(this.state.filter(t => t.id !== id));
    }
}
