import axios from "axios";
import { SignUpInput } from "../src/domain/signup";

const baseURL = "http://localhost:3000";
describe("API endpoints", () => {

  test("deve criar uma conta de passageiro", async () => {
    const input = {
      name: "John Doe",
      email: `john.doe${Math.random()}@test.com`,
      cpf: "123.123.123-87",
      isPassenger: true,
    };
    const response = await axios.post(`${baseURL}/signup`, input);
    const output = response.data;
    expect(output.accountId).toBeDefined();
    const accountResponse = await axios.get(`${baseURL}/accounts/${output.accountId}`);
    const account = accountResponse.data;
    expect(account.name).toBe(input.name);
    expect(account.email).toBe(input.email);
    expect(account.is_passenger).toBe(input.isPassenger);
  });

  test("deve criar uma corrida", async () => {
    const passengerId = await createAccount(true);
    const rideData = {
      passengerId: passengerId,
      from: { lat: 123, long: 456 },
      to: { lat: 789, long: 0o12 },
    };
    const response = await axios.post(`${baseURL}/rides`, rideData);
    const { rideId } = response.data;
    expect(rideId).toBeDefined();
    const rideResponse = await axios.get(`${baseURL}/rides/${rideId}`);
    const ride = rideResponse.data;
    expect(ride.passenger_id).toBe(rideData.passengerId);
    expect(ride.from_lat).toEqual(rideData.from.lat);
    expect(ride.from_long).toEqual(rideData.from.long);
    expect(ride.to_lat).toEqual(rideData.to.lat);
    expect(ride.to_long).toEqual(rideData.to.long);
    expect(ride.driver_id).toEqual(null);
  });

  test("deve aceitar uma corrida", async () => {
    const passengerId = await createAccount(true);
    const rideId = await createPendingRide(passengerId);
    const driverId = await createAccount(false);
    const response = await axios.post(`${baseURL}/rides/${rideId}/accept`, { driverId });
    expect(response.status).toBe(200);
    const acceptedRideResponse = await axios.get(`${baseURL}/rides/${rideId}`);
    const acceptedRide = acceptedRideResponse.data;
    expect(acceptedRide.status).toBe("accepted");
    expect(acceptedRide.driver_id).toBe(driverId);
  });
});

async function createAccount(isPassenger: boolean): Promise<string> {
  const input: SignUpInput = {
    name: isPassenger ? "John Doe" : "Jane Smith",
    email: isPassenger ? `john.doe${Math.random()}@test.com` : `jane.smiths${Math.random()}@test.com`,
    cpf: "123.123.123-87",
    isPassenger: isPassenger,
    isDriver: !isPassenger,
    carPlate: !isPassenger ? "NON3042" : null
  };
  const response = await axios.post("http://localhost:3000/signup", input);
  return response.data.accountId;
}

async function createPendingRide(passengerId: string): Promise<string> {
  const rideData = {
    passengerId: passengerId,
    from: { lat: 123, long: 456 },
    to: { lat: 789, long: 0o12 },
  };
  const response = await axios.post(`${baseURL}/rides`, rideData);
  return response.data.rideId;
}
