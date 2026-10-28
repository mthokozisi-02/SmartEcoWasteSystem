import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { Signup } from './signup';
import { VerifyEmail } from './verify-email';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login },
    { path: 'sign-up', component: Signup },
    { path: 'signup', component: Signup },
    { path: 'verify-email', component: VerifyEmail }
] as Routes;
