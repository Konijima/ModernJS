import { HomePage } from './demo/pages/home.page.js';
import { GetStartedPage } from './demo/pages/get-started.page.js';
import { FeaturesPage } from './demo/pages/features.page.js';
import { TodoListComponent } from './demo/components/todo-list.component.js';
import { CounterComponent } from './demo/components/counter.component.js';
import { PipesDemoComponent } from './demo/components/pipes-demo.component.js';

export const routes = [
    { 
        path: '/', 
        component: HomePage,
        data: {
            title: 'meta.home.title',
            meta: [
                { name: 'description', content: 'meta.home.desc' }
            ]
        }
    },
    { 
        path: '/get-started', 
        component: GetStartedPage,
        data: {
            title: 'meta.get_started.title',
            meta: [
                { name: 'description', content: 'meta.get_started.desc' }
            ]
        }
    },
    { 
        path: '/features', 
        component: FeaturesPage,
        data: {
            title: 'meta.features.title',
            meta: [
                { name: 'description', content: 'meta.features.desc' }
            ]
        },
        children: [
            { path: '', redirectTo: 'todo' },
            { path: 'todo', component: TodoListComponent },
            { path: 'counter', component: CounterComponent },
            { path: 'pipes', component: PipesDemoComponent }
        ]
    },
    { path: '**', component: HomePage }
];
