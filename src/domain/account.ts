export interface Account {
  account_id?: string;
  name: string;
  email: string;
  cpf: string;
  car_plate?: string;
  is_passenger?: boolean;
  is_driver?: boolean;
}
