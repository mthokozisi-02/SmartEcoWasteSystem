import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
    CreateBuildingDto,
    CreatePropertyDto,
    CreateWasteZoneDto,
    ResponseBuildingDto,
    ResponsePropertyDto,
    ResponseWasteZoneDto
} from 'src/assets/interfaces/commercial-saas-dtos';

const apiUrl = `${environment.apiUrl}/Property`;

@Injectable({
    providedIn: 'root'
})
export class PropertyService {
    private http = inject(HttpClient);

    createProperty(dto: CreatePropertyDto): Observable<any> {
        return this.http.post<any>(`${apiUrl}/create-property`, dto);
    }

    getAllProperties(): Observable<any> {
        return this.http.get<any>(`${apiUrl}/get-all-properties`);
    }

    getProperty(id: number): Observable<any> {
        return this.http.get<any>(`${apiUrl}/get-property/${id}`);
    }

    createBuilding(dto: CreateBuildingDto): Observable<any> {
        return this.http.post<any>(`${apiUrl}/create-building`, dto);
    }

    getBuildings(propertyId: number): Observable<any> {
        return this.http.get<any>(`${apiUrl}/get-buildings/${propertyId}`);
    }

    createWasteZone(dto: CreateWasteZoneDto): Observable<any> {
        return this.http.post<any>(`${apiUrl}/create-waste-zone`, dto);
    }

    getWasteZones(propertyId: number): Observable<any> {
        return this.http.get<any>(`${apiUrl}/get-waste-zones/${propertyId}`);
    }
}
