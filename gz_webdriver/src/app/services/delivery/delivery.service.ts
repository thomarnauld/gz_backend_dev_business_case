import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Delivery } from '../../shared/models/Delivery';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  constructor(private http: HttpClient) {}

  getDeliveryById(searchId: string): Observable<Delivery> {
    return this.http.get<Delivery>(
      'http://localhost:3000/api/delivery/' + searchId
    );
  }

  updDelivery(searchId: string, data: Delivery): Observable<Delivery> {
    return this.http.put<Delivery>(
      'http://localhost:3000/api/delivery/' + searchId,
      data
    );
  }
}
