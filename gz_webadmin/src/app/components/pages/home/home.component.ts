import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { v4 as uuidv4 } from 'uuid';

import { Delivery } from '../../../shared/models/Delivery';
import { Package } from '../../../shared/models/Package';
import { PackageService } from '../../../services/package/package.service';
import { DeliveryService } from '../../../services/delivery/delivery.service';
import {
  FormType,
  deliveryOrderInit,
  packageOrderInit,
} from '../../../../data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
    FormsModule, // For template-driven forms (optional)
    ReactiveFormsModule, // For reactive forms
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  package: Package[] = [];
  dataSelected: Package | Delivery | null;
  delivery: Delivery[] = [];
  validatedForm = false;
  module: string | null;
  table: string | null;
  operation: string | null;
  errorMessage = '';
  Form: FormGroup;
  controlOrder: FormType[] = [];
  packageOrder: FormType[] = packageOrderInit;
  deliveryOrder: FormType[] = deliveryOrderInit;

  constructor(
    private packageService: PackageService,
    private deliveryService: DeliveryService,
    private formBuilder: FormBuilder
  ) {
    this.module = 'home';
    this.table = null;
    this.operation = null;
    this.dataSelected = null;
    this.Form = this.formBuilder.group({});
  }

  ngOnInit() {
    this.packageService.getAll().subscribe({
      next: (data: Package[]) => (this.package = data),
      error: (error) => console.log('error', error),
    });
    this.deliveryService.getAll().subscribe({
      next: (data: Delivery[]) => (this.delivery = data),
      error: (error) => console.log('error', error),
    });
  }

  get f() {
    return this.Form.controls;
  }

  changeModule = (label = 'home') => (this.module = label);
  isDelivery = (value: any) => typeof value.delivery_id === 'string';
  isPackage = (value: any) => typeof value.from_name === 'string';
  isError = (value: any) =>
    typeof value === 'object' && typeof value.message === 'string';

  selectData(data: Package | Delivery): void {
    this.isPackage(data) && (this.dataSelected = data as Package);
    this.isDelivery(data) && (this.dataSelected = data as Delivery);
  }

  geolocationValidator(): ValidatorFn {
    const pattern = /^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)?\s*$/; // Allow optional trailing comma
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value || typeof value !== 'string')
        return { invalidGeolocation: { value: control.value } };
      if (!pattern.test(value))
        return { invalidGeolocation: { value: control.value } };
      const parts = value.trim().split(/[,:]/); // Flexible delimiter and whitespace handling
      if (parts.length !== 1 && parts.length !== 2)
        return { invalidGeolocation: { value: control.value } }; // Error for invalid part count
      const lat = parseFloat(parts[0]);
      if (isNaN(lat) || lat < -90 || lat > 90)
        return { invalidGeolocation: { value: control.value } }; // Error for invalid lat
      const lng = parts.length === 2 ? parseFloat(parts[1]) : null;
      if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180))
        return { invalidGeolocation: { value: control.value } }; // Error for invalid lng
      return null; // Validation passed
    };
  }

  onSubmit() {
    this.validatedForm = true;
    if (this.Form.invalid) {
      this.markFormGroupTouched(this.Form);
      return;
    } else {
      let data = { ...this.Form.value };
      let thread: any;
      let id = '';
      if (this.table === 'package') {
        let from_location = data.from_location.split(',');
        let to_location = data.to_location.split(',');
        data.from_location = {
          lat: from_location[0],
          lng: from_location[1],
        };
        data.to_location = {
          lat: to_location[0],
          lng: to_location[1],
        };
        id = data.package_id;
        thread =
          this.operation === 'update'
            ? this.packageService.updPackage(id, data)
            : this.packageService.addPackage(id, data);
        thread.subscribe({
          next: this.handleThreadResponse.bind(this),
          error: (error: any) => console.log('error', error),
        });
      }
      if (this.table === 'delivery') {
        let location = data.location.split(',');
        data.location = {
          lat: location[0],
          lng: location[1],
        };
        id = data.delivery_id;
        // this.deliveryService.updDelivery(id, data)
        this.deliveryService.addDelivery(id, data).subscribe({
          next: this.handleThreadResponse.bind(this),
          error: (error: any) => console.log('error', error),
        });
        //upd package
        const idx = this.package.findIndex(
          (i) => i.package_id === data.package_id
        );
        let packageToUpdate = { ...this.package[idx] };
        packageToUpdate.active_delivery_id = data.delivery_id;
        this.packageService
          .updPackage(packageToUpdate.package_id, packageToUpdate)
          .subscribe({
            next: () =>
              (this.package[
                this.package.findIndex(
                  (i) => i.package_id === packageToUpdate.package_id
                )
              ] = packageToUpdate),
          });
      }
    }
  }

  handleThreadResponse(
    result: { message: string; statusCode: number } | Package | Delivery
  ) {
    if (this.isError(result)) {
      const error = result as { message: string; statusCode: number };
      this.errorMessage = 'Error :' + error.message;
    } else {
      if (this.table === 'package') {
        const data = result as Package;
        this.operation === 'create'
          ? (this.package = [...this.package, data])
          : (this.package[
              this.package.findIndex((i) => i.package_id === data.package_id)
            ] = data);
      }
      if (this.table === 'delivery') {
        const data = result as Delivery;
        if (this.operation === 'create') {
          this.delivery = [...this.delivery, data];
        } else {
          this.delivery[
            this.delivery.findIndex((i) => i.delivery_id === data.delivery_id)
          ] = data;
        }
      }
      this.changeModule();
    }
  }

  getInputType(key: string): string {
    switch (key) {
      case 'weight':
      case 'width':
      case 'height':
      case 'depth':
        return 'number';
      default:
        return 'text';
    }
  }

  markFormGroupReset(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.reset();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  showForm(
    data: Package | Delivery | null = null,
    table: string,
    operation: string
  ): void {
    this.errorMessage = '';
    this.operation = operation;
    this.table = table;
    if (table === 'package') {
      this.controlOrder = this.packageOrder;
      data = data as Package | null;
      this.Form = this.formBuilder.group({
        package_id: [data ? data.package_id : uuidv4(), Validators.required], // Assuming UUID format
        active_delivery_id: [
          data
            ? data.active_delivery_id
              ? data.active_delivery_id
              : null
            : null,
        ],
        description: [data ? data.description : '', Validators.required],
        weight: [
          data ? data.weight : '',
          [Validators.required, Validators.min(0)],
        ],
        width: [
          data ? data.width : '',
          [Validators.required, Validators.min(0)],
        ],
        height: [
          data ? data.height : '',
          [Validators.required, Validators.min(0)],
        ],
        depth: [
          data ? data.depth : '',
          [Validators.required, Validators.min(0)],
        ],
        from_name: [data ? data.from_name : '', Validators.required],
        from_address: [data ? data.from_address : '', Validators.required],
        from_location: [
          data ? `${data.from_location.lat},${data.from_location.lng}` : '',
          [this.geolocationValidator()],
        ],
        to_name: [data ? data.to_name : '', Validators.required],
        to_address: [data ? data.to_address : '', Validators.required],
        to_location: [
          data ? `${data.to_location.lat},${data.to_location.lng}` : '',
          [this.geolocationValidator()],
        ],
      });
    }
    if (table === 'delivery') {
      this.controlOrder = this.deliveryOrder;
      data = data as Delivery | null;
      this.Form = this.formBuilder.group({
        delivery_id: [data ? data.delivery_id : uuidv4(), Validators.required],
        package_id: [data ? data.package_id : '', Validators.required], // Assuming UUID format
        pickup_time: [data ? data.pickup_time : ''],
        start_time: [data ? data.start_time : ''],
        end_time: [data ? data.end_time : ''],
        location: [
          data ? `${data.location.lat},${data.location.lng}` : '0,0',
          [this.geolocationValidator()],
        ],
        status: [data ? data.status : 'open', [Validators.required]],
      });
    }
    this.changeModule('form');
  }

  confirmDelete(data: Package | Delivery, table: string): void {
    this.changeModule('delete');
    this.table = table;
    this.selectData(data);
  }

  deleteItem(data: Package | Delivery): void {
    if (this.isPackage(data)) {
      data = data as Package;
      const id = data.package_id;
      this.packageService.delPackage(id).subscribe({
        next: () => {
          const filteredArr = this.package.filter((i) => i.package_id !== id);
          this.package = filteredArr;
          this.changeModule();
        },
        error: (error) => console.log('error', error),
      });
    }
    if (this.isDelivery(data)) {
      data = data as Delivery;
      const id = data.delivery_id;
      this.deliveryService.delDelivery(id).subscribe({
        next: () => {
          const filteredArr = this.delivery.filter((i) => i.delivery_id !== id);
          this.delivery = filteredArr;
          this.changeModule();
        },
        error: (error) => console.log('error', error),
      });
    }
  }
}
