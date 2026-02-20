import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VerifyBinDto } from 'src/assets/interfaces/verify-bin-dto';

const apiUrl = 'https://localhost:7107/api';

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    constructor(private http: HttpClient) {}

    getAll(): Observable<any> {
        return this.http.get<any>(`${apiUrl}/get-all-reports`);
    }

    getAllUserData(): Observable<any> {
        return this.http.get<any>(`${apiUrl}/get-graph-data`);
    }

    clearReport(report: VerifyBinDto): Observable<any> {
        console.log(report);
        return this.http.post<any>(`${apiUrl}/verify-report`, report);
    }

    deleteReport(Id: number): Observable<any> {
        return this.http.delete<any>(`${apiUrl}/delete-report/${Id}`);
    }
}
