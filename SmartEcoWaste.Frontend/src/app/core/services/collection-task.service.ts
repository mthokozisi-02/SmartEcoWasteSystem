import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
    CreateCollectionTaskDto,
    ResponseCollectionTaskDto,
    ResponseInspectionLogDto,
    SubmitInspectionDto
} from 'src/assets/interfaces/commercial-saas-dtos';

const apiUrl = `${environment.apiUrl}/CollectionTask`;

@Injectable({
    providedIn: 'root'
})
export class CollectionTaskService {
    private http = inject(HttpClient);

    createTask(dto: CreateCollectionTaskDto): Observable<any> {
        return this.http.post<any>(`${apiUrl}/create-task`, dto);
    }

    updateTask(taskId: number, dto: any): Observable<any> {
        return this.http.put<any>(`${apiUrl}/update-task/${taskId}`, dto);
    }

    getAllTasks(): Observable<any> {
        return this.http.get<any>(`${apiUrl}/get-all-tasks`);
    }

    getMyTasks(): Observable<any> {
        return this.http.get<any>(`${apiUrl}/get-my-tasks`);
    }

    updateTaskStatus(taskId: number, status: number): Observable<any> {
        return this.http.put<any>(`${apiUrl}/update-status/${taskId}?status=${status}`, {});
    }

    submitInspection(dto: SubmitInspectionDto): Observable<any> {
        return this.http.post<any>(`${apiUrl}/submit-inspection`, dto);
    }

    getInspections(binId?: number): Observable<any> {
        const query = binId ? `?binId=${binId}` : '';
        return this.http.get<any>(`${apiUrl}/get-inspections${query}`);
    }

    approveAnomaly(inspectionLogId: number, resolutionNotes?: string): Observable<any> {
        return this.http.post<any>(`${apiUrl}/approve-anomaly`, {
            inspectionLogId,
            resolutionNotes
        });
    }

    rejectAnomaly(inspectionLogId: number, rejectionReason: string): Observable<any> {
        return this.http.post<any>(`${apiUrl}/reject-anomaly`, {
            inspectionLogId,
            rejectionReason
        });
    }
}
