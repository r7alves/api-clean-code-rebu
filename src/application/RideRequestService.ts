import { Account } from '../domain/account';
import { IAccountRepository } from '../infrastructure/contract/IAccountRepository';
import { IRideRepository } from '../infrastructure/contract/IRideRepository';

export class RideRequestService {
  private accountRepository: IAccountRepository;
  private rideRepository: IRideRepository;

  constructor(accountRepository: IAccountRepository, rideRepository: IRideRepository) {
    this.accountRepository = accountRepository;
    this.rideRepository = rideRepository;
  }

  async execute(passengerId: string, from: { lat: number, long: number }, to: { lat: number, long: number }): Promise<string> {
    const passenger: Account | null = await this.accountRepository.getAccount(passengerId);
    if (!passenger || !passenger.is_passenger) {
      throw new Error("Passenger not found or is not valid");
    }

    const existingRide = await this.rideRepository.getRideByPassengerId(passengerId);
    if (existingRide && existingRide.status !== "completed") {
      throw new Error("Passenger already has an ongoing ride");
    }

    const rideId = crypto.randomUUID();

    const date = new Date();

    await this.rideRepository.createRide({
      ride_id: rideId,
      passenger_id: passengerId,
      status: "requested",
      from_lat: from.lat,
      from_long: from.long,
      to_lat: to.lat,
      to_long: to.long,
      date: date
    });
    console.log(rideId);

    return rideId;
  }
}
