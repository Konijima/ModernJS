import { Component, Router } from '@modernjs/core';
import { routes } from './app.routes.js';
import './styles/main.css';

export const App = Component.create({
  selector: '{{appTagName}}-app',
  inject: {
    router: Router
  },
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="logo">{{projectName}}</div>
      </header>
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  onInit() {
    this.router.register(routes);
  }
});
