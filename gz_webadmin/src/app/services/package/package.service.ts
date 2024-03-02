import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Package } from '../../shared/models/Package';

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Package[]> {
    return this.http.get<Package[]>('http://localhost:3000/api/package');
  }

  getPackageById(searchId: string): Observable<Package> {
    return this.http.get<Package>(
      'http://localhost:3000/api/package/' + searchId
    );
  }

  addPackage(searchId: string, data: Package): Observable<Package> {
    return this.http.post<Package>(
      'http://localhost:3000/api/package/' + searchId,
      data
    );
  }

  updPackage(searchId: string, data: Package): Observable<Package> {
    return this.http.put<Package>(
      'http://localhost:3000/api/package/' + searchId,
      data
    );
  }

  delPackage(searchId: string): Observable<Package> {
    return this.http.delete<Package>(
      'http://localhost:3000/api/package/' + searchId
    );
  }
}
