export interface Delivery {
  delivery_id: string; // GUID format
  package_id: string; // GUID format
  pickup_time: Date; // Timestamp representing pickup time
  start_time: Date; // Timestamp representing start time of delivery
  end_time: Date; // Timestamp representing end time of delivery
  location: {
    lat: number; // lat coordinate
    lng: number; // lng coordinate
  };
  status: DeliveryStatus; // Enum value representing delivery status
}

export enum DeliveryStatus {
  open = 'open',
  pickedup = 'picked-up',
  intransit = 'in-transit',
  delivered = 'delivered',
  failed = 'failed',
}
