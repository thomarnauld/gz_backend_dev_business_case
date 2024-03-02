import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Package } from '../../../shared/models/Package';
import { Delivery } from '../../../shared/models/Delivery';
import { PackageService } from '../../../services/package/package.service';
import { ActivatedRoute } from '@angular/router';
import { DeliveryService } from '../../../services/delivery/delivery.service';
import { GoogleMapsModule } from '@angular/google-maps';
import { Socket, io } from 'socket.io-client';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  package: Package | null | undefined = null;
  delivery: Delivery | null | undefined = null;
  isLoading = true;
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
    private activatedRoute: ActivatedRoute
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
    this.isLoading = true; // Optional loading indicator
    // Subscribe to route parameter changes
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      const searchId: string | null = paramMap.get('searchId');
      if (searchId) {
        this.fetchPackageAndDelivery(searchId);
      }
    });
  }

  fetchPackageAndDelivery(searchId: string) {
    this.isLoading = true;
    this.packageService.getPackageById(searchId).subscribe({
      next: this.handlePackageResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }

  handlePackageResponse(pack_data: Package) {
    this.package = pack_data;
    if (pack_data?.active_delivery_id) {
      this.deliveryService
        .getDeliveryById(pack_data.active_delivery_id)
        .subscribe({
          next: this.handleDeliveryResponse.bind(this),
          error: this.handleDeliveryError.bind(this),
        });
    } else {
      this.isLoading = false;
    }
  }

  handleDeliveryResponse(deliv_data: Delivery) {
    this.socket.emit('subscribe', {
      delivery_id: deliv_data.delivery_id,
    });
    this.delivery = deliv_data;
    this.isLoading = false;
  }

  handleDeliveryError(error: any) {
    console.error('Error fetching delivery:', error);
    this.delivery = null;
    this.isLoading = false;
  }

  handleError(error: any) {
    console.error('Error fetching package:', error);
    this.package = null;
    this.delivery = null;
    this.isLoading = false;
  }
}
