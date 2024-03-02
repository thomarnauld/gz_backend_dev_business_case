export interface Package {
  package_id: string; // UUID format recommended
  active_delivery_id: string | null; // Allow null for inactive deliveries
  description: string;
  weight: number; // In grams
  width: number; // In centimeters
  height: number; // In centimeters
  depth: number; // In centimeters
  from_name: string;
  from_address: string;
  from_location: {
    lat: number;
    lng: number;
  };
  to_name: string;
  to_address: string;
  to_location: {
    lat: number;
    lng: number;
  };
}
