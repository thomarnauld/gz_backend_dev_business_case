export interface FormType {
  id: string;
  des: string;
  readonly: boolean;
  type: string;
}

export const packageOrderInit: FormType[] = [
  { id: 'package_id', des: '', readonly: true, type: 'input' },
  { id: 'active_delivery_id', des: '', readonly: true, type: 'input' },
  { id: 'description', des: '', readonly: false, type: 'input' },
  { id: 'weight', des: '', readonly: false, type: 'input' },
  { id: 'width', des: '', readonly: false, type: 'input' },
  { id: 'height', des: '', readonly: false, type: 'input' },
  { id: 'depth', des: '', readonly: false, type: 'input' },
  { id: 'from_name', des: '', readonly: false, type: 'input' },
  { id: 'from_address', des: '', readonly: false, type: 'input' },
  { id: 'from_location', des: '', readonly: false, type: 'input' },
  { id: 'to_name', des: '', readonly: false, type: 'input' },
  { id: 'to_address', des: '', readonly: false, type: 'input' },
  { id: 'to_location', des: '', readonly: false, type: 'input' },
];

export const deliveryOrderInit: FormType[] = [
  { id: 'delivery_id', des: '', readonly: true, type: 'input' },
  { id: 'package_id', des: '', readonly: false, type: 'select' },
  { id: 'pickup_time', des: '', readonly: true, type: 'input' },
  { id: 'start_time', des: '', readonly: true, type: 'input' },
  { id: 'end_time', des: '', readonly: true, type: 'input' },
  { id: 'location', des: '', readonly: true, type: 'input' },
  { id: 'status', des: '', readonly: true, type: 'input' },
];
