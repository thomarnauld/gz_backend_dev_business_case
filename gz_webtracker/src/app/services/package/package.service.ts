import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Package } from '../../shared/models/Package';
import { Observable } from 'rxjs';

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
}
