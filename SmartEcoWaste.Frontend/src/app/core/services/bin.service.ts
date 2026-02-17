import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateBinDto } from 'src/assets/interfaces/create-bin-dto';
import { CreateUserDto } from 'src/assets/interfaces/create-user-dto';

const apiUrl = 'https://localhost:7107/api';

@Injectable({
    providedIn: 'root'
})
export class BinService {
    constructor(private http: HttpClient) {}

    reverseGeocode(lat: number, lon: number) {
        return this.http.get<any>(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    }

    createBin(bin: CreateBinDto): Observable<any> {
        console.log(bin);
        return this.http.post<any>(`${apiUrl}/create-bin`, bin);
    }

    updateBin(bin: CreateBinDto): Observable<any> {
        console.log(bin);
        return this.http.put<any>(`${apiUrl}/update-bin`, bin);
    }

    deleteBin(Id: number): Observable<any> {
        return this.http.delete<any>(`${apiUrl}/delete-bin/${Id}`);
    }

    getAll(): Observable<any> {
        return this.http.get<any>(`${apiUrl}/get-all-bins`);
    }
}
