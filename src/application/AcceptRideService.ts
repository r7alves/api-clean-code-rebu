import { IAccountRepository } from "../infrastructure/contract/IAccountRepository";
import { IRideRepository } from "../infrastructure/contract/IRideRepository";

export class AcceptRideService {
  constructor(private rideRepository: IRideRepository, private accountRepository: IAccountRepository) {}

  async execute(rideId: string, driverId: string): Promise<void> {
    await this.checkDriverAuthorization(driverId);
    await this.checkRideAvailability(rideId);
    await this.checkDriverRideStatus(driverId);
    await this.associateDriverWithRide(rideId, driverId);
  }

  private async checkDriverAuthorization(driverId: string): Promise<void> {
    const isDriverAuthorized = await this.accountRepository.checkDriver(driverId);
    if (!isDriverAuthorized) {
      throw new Error("O motorista especificado não está autorizado.");
    }
  }

  private async checkRideAvailability(rideId: string): Promise<void> {
    const ride = await this.rideRepository.getRide(rideId);
    if (!ride || ride.status !== "requested") {
      throw new Error("A corrida especificada não está disponível para aceitação.");
    }
  }

  private async checkDriverRideStatus(driverId: string): Promise<void> {
    const existingRide = await this.rideRepository.getDriverRide(driverId);
    if (existingRide && (existingRide.status === "accepted" || existingRide.status === "in_progress")) {
      throw new Error("O motorista já está associado a outra corrida.");
    }
  }

  private async associateDriverWithRide(rideId: string, driverId: string): Promise<void> {
    await this.rideRepository.acceptRide(rideId, driverId);
  }
}
