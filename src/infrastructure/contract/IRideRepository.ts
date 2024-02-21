import { Ride } from '../../domain/ride';

export interface IRideRepository {
  createRide(rideData: Ride): Promise<void>;
  getRide(rideId: string): Promise<Ride | null>;
  getDriverRide(driverId: string): Promise<Ride | null>;
  acceptRide(rideId: string, driverId: string): Promise<void>;
  getRideByPassengerId(passengerId: string): Promise<Ride | null>;
}
