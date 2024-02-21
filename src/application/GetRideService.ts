import { Ride } from '../domain/ride';
import { IRideRepository } from '../infrastructure/contract/IRideRepository';

export class GetRideService {
  constructor(private rideRepository: IRideRepository) {}

  async execute(rideId: string): Promise<Ride | null> {
    return await this.rideRepository.getRide(rideId);
  }
}
