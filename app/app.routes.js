import { HomePage } from './demo/pages/home.page.js';
import { GetStartedPage } from './demo/pages/get-started.page.js';
import { FeaturesPage } from './demo/pages/features.page.js';
import { TodoListComponent } from './demo/components/todo-list.component.js';
import { CounterComponent } from './demo/components/counter.component.js';
import { PipesDemoComponent } from './demo/components/pipes-demo.component.js';
import { FormDemoComponent } from './demo/components/form-demo.component.js';
import { HttpDemoComponent } from './demo/components/http-demo.component.js';
import { LoginPage } from './demo/pages/login.page.js';
import { DashboardPage } from './demo/pages/dashboard.page.js';
import { BenchmarkPage } from './demo/pages/benchmark.page.js';
import { AuthGuard } from './demo/guards/auth.guard.js';

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
        }
    },
    {
        path: '/benchmark',
        component: BenchmarkPage,
        data: {
            title: 'Benchmark'
        }
    },
    { 
        path: '/todo', 
        component: TodoListComponent,
            { path: 'todo', component: TodoListComponent },
            { path: 'counter', component: CounterComponent },
            { path: 'pipes', component: PipesDemoComponent },
            { path: 'form', component: FormDemoComponent },
            { path: 'http', component: HttpDemoComponent },
            { 
                path: 'login', 
                component: LoginPage,
                data: { title: 'login.title' }
            },
            { 
                path: 'dashboard', 
                component: DashboardPage,
                canActivate: [AuthGuard],
                data: { title: 'Dashboard' }
            }
        ]
    },
    { path: '**', component: HomePage }
];
