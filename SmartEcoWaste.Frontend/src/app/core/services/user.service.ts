import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CreateUserDto } from 'src/assets/interfaces/create-user-dto';
import { UpdateRoleDto } from 'src/assets/interfaces/update-role-dto';

const apiUrl = 'https://localhost:7107/api';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private http: HttpClient) {}

    createUser(user: CreateUserDto): Observable<any> {
        console.log(user);
        return this.http.post<any>(`${apiUrl}/create-user`, user);
    }

    UpdateRole(role: UpdateRoleDto): Observable<any> {
        console.log(role);
        return this.http.post<any>(`${apiUrl}/assign-role`, role);
    }

    updateUser(user: CreateUserDto): Observable<any> {
        console.log(user);
        return this.http.put<any>(`${apiUrl}/update-user`, user);
    }

    deleteUser(Id: number): Observable<any> {
        return this.http.delete<any>(`${apiUrl}/delete-user/${Id}`);
    }

    getAll(): Observable<any> {
        return this.http.get<any>(`${apiUrl}/get-all-users`);
    }

    getAllRoles(): Observable<any> {
        return this.http.get<any>(`${apiUrl}/get-roles`);
    }
}
