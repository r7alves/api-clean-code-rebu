import pgp, { IDatabase } from "pg-promise";
import { Ride } from "../domain/ride";
import { IRideRepository } from "./contract/IRideRepository";

export class RideRepository implements IRideRepository {
  private connection: IDatabase<any>;

  constructor(connection: IDatabase<any>) {
    this.connection = connection;
  }

  async createRide(rideData: Ride): Promise<void> {
    await this.connection.query(
      "INSERT INTO cccat15.ride (ride_id, passenger_id, status, fare, distance, from_lat, from_long, to_lat, to_long, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
      [
        rideData.ride_id,
        rideData.passenger_id,
        rideData.status,
        rideData.fare,
        rideData.distance,
        rideData.from_lat,
        rideData.from_long,
        rideData.to_lat,
        rideData.to_long,
        rideData.date,
      ]
    );
  }

  async getRide(rideId: string): Promise<Ride | null> {
    const [ride] = await this.connection.query("SELECT * FROM cccat15.ride WHERE ride_id = $1", [rideId]);
    if (!ride) {
      return null;
    }
    return {
      ...ride,
      fare: ride.fare ? parseFloat(ride.fare) : null,
      distance: ride.distance ? parseFloat(ride.distance) : null,
      from_lat: parseFloat(ride.from_lat),
      from_long: parseFloat(ride.from_long),
      to_lat: parseFloat(ride.to_lat),
      to_long: parseFloat(ride.to_long),
    };
  }

  async getRideByPassengerId(passengerId: string): Promise<Ride | null> {
    const [ride] = await this.connection.query("SELECT * FROM cccat15.ride WHERE passenger_id = $1", [passengerId]);
    if (!ride) {
      return null;
    }
    return {
      ...ride,
      fare: ride.fare ? parseFloat(ride.fare) : null,
      distance: ride.distance ? parseFloat(ride.distance) : null,
      from_lat: parseFloat(ride.from_lat),
      from_long: parseFloat(ride.from_long),
      to_lat: parseFloat(ride.to_lat),
      to_long: parseFloat(ride.to_long),
    };
  }

  async getDriverRide(driverId: string): Promise<Ride | null> {
    const [ride] = await this.connection.query("SELECT * FROM cccat15.ride WHERE driver_id = $1", [driverId]);
    return ride || null;
  }

  async acceptRide(rideId: string, driverId: string): Promise<void> {
    await this.connection.query(
      "UPDATE cccat15.ride SET status = $1, driver_id = $2 WHERE ride_id = $3",
      ["accepted", driverId, rideId]
    );
  }
}
