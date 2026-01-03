import { HomePage } from './pages/home.page.js';

export const routes = [
  {
    path: '/',
    component: HomePage
  },
  {
    path: '**',
    component: HomePage
  }
];
