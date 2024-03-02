import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import {
  Location,
  BrowserPlatformLocation,
  isPlatformBrowser,
} from '@angular/common';

import { DeliveryService } from '../../../services/delivery/delivery.service';
import { PackageService } from '../../../services/package/package.service';
import { Delivery, DeliveryStatus } from '../../../shared/models/Delivery';
import { Package } from '../../../shared/models/Package';
import { Socket, io } from 'socket.io-client';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  buttons = [
    { code: 1, label: DeliveryStatus.pickedup, color: 'rgb(123,168,215)' },
    { code: 2, label: DeliveryStatus.intransit, color: 'rgb(242,156,56)' },
    { code: 3, label: DeliveryStatus.delivered, color: 'rgb(120,165,90)' },
    { code: 4, label: DeliveryStatus.failed, color: 'rgb(209,109,106)' },
  ];
  package: Package | null = null;
  delivery: Delivery | null = null;
  fetchLocationTimeOut: any;
  socket: Socket;

  iconA = {
    url: './assets/locationa.png',
    scaledSize: new google.maps.Size(32, 32),
  };
  iconB = {
    url: './assets/locationb.png',
    scaledSize: new google.maps.Size(32, 32),
  };
  iconC = {
    url: './assets/laptop.png',
    scaledSize: new google.maps.Size(32, 32),
  };

  constructor(
    private packageService: PackageService,
    private deliveryService: DeliveryService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private browserPlatformLocation: BrowserPlatformLocation
  ) {
    this.socket = io('ws://localhost:3000', {
      transports: ['websocket', 'polling', 'flashsocket'],
    });
    this.socket.on(
      'delivery_updated',
      (delivery_updated) => (this.delivery = delivery_updated)
    );
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      const searchId: string | null = paramMap.get('searchId');
      if (searchId) {
        this.fetchPackageAndDelivery(searchId);
      } else {
        this.fetchLocationTimeOut = null;
      }
    });
  }

  getLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (this.delivery) {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.socket.emit('location_changed', {
            event: 'location_changed',
            delivery_id: this.delivery.delivery_id,
            location: newLocation,
          });
        }
      },
      (error) => {
        console.log('error', error);
      }
    );
  }

  fetchPackageAndDelivery(searchId: string) {
    this.deliveryService.getDeliveryById(searchId).subscribe({
      next: (delivery_data: Delivery) => {
        if (delivery_data?.delivery_id) {
          this.packageService
            .getPackageById(delivery_data.package_id)
            .subscribe({
              next: (package_data: Package) => {
                this.delivery = delivery_data;
                this.package = package_data;
                // Subscribe to updates for a specific delivery
                this.socket.emit('subscribe', {
                  delivery_id: this.delivery.delivery_id,
                });
                this.fetchLocationTimeOut = setInterval(() => {
                  this.getLocation();
                }, 20000);
              },
              error: (error) => this.handleError(error),
            });
        }
      },
      error: (error) => this.handleError(error),
    });
  }

  handleError(error: any) {
    console.error('error', error);
    clearInterval(this.fetchLocationTimeOut);
    this.package = null;
    this.delivery = null;
  }

  getstatus(code: number, status: string): boolean {
    let isActive = false;
    switch (code) {
      case 1:
        isActive = status === 'open';
        break;
      case 2:
        isActive = status === 'picked-up';
        break;
      case 3:
      case 4:
        isActive = status === 'in-transit';
        break;
    }
    return isActive;
  }

  updDelivery(data: DeliveryStatus): void {
    if (this.delivery) {
      this.socket.emit('status_changed', {
        event: 'status_changed',
        delivery_id: this.delivery.delivery_id,
        status: data,
      });
    }
  }
}
