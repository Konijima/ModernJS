import { Component } from '@modernjs/core';

export const HomePage = Component.create({
  selector: 'home-page',
  template: `
    <div class="home-container">
      <div class="hero">
        <h1>Welcome to {{projectName}}</h1>
        <p>Your new ModernJS application is ready.</p>
        <div class="actions">
          <a href="https://github.com/konijima/modernjs" target="_blank" class="btn primary">Documentation</a>
        </div>
      </div>
    </div>
  `
});
