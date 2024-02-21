import express, { Request, Response } from "express";
import { SignupService } from "./application/SignupService";
import { AccountService } from "./application/AccountService";
import { MockAccountRepository } from "./infrastructure/MockAccountRepository";
import { IAccountRepository } from "./infrastructure/contract/IAccountRepository";
import { AccountRepository } from "./infrastructure/AccountRepository";
import errorHandler from "./middleware/errorHandler";
import { RideRepository } from "./infrastructure/RideRepository";
import { RideRequestService } from "./application/RideRequestService";
import { IRideRepository } from "./infrastructure/contract/IRideRepository";
import { GetRideService } from "./application/GetRideService";
import { AcceptRideService } from "./application/AcceptRideService";
const pgp = require('pg-promise')();

const connection = pgp("postgres://maxter:@localhost:5432/cccat15");
const app = express();
const port = 3000;

const accountRepository: IAccountRepository = new AccountRepository(connection);
const rideRepository: IRideRepository = new RideRepository(connection);
const signupService = new SignupService(accountRepository);
const accountService = new AccountService(accountRepository);
const rideRequestService = new RideRequestService(accountRepository, rideRepository);
const getRideService = new GetRideService(rideRepository);
const acceptRideService = new AcceptRideService(rideRepository, accountRepository);

app.use(express.json());
app.use(errorHandler);

app.post("/signup", async (req: Request, res: Response) => {
  try {
    const result = await signupService.execute(req.body);
    res.status(result.error ? 400 : 201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
  try {
    const account = await accountService.execute(req.params.accountId);
    if (account) {
      res.json(account);
    } else {
      res.status(404).json({ error: "Account not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/rides", async (req: Request, res: Response) => {
  try {
    const { passengerId, from, to } = req.body;
    const rideId = await rideRequestService.execute(passengerId, from, to);
    res.status(201).json({ rideId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/rides/:rideId", async (req: Request, res: Response) => {
  try {
    const rideId = req.params.rideId;
    const ride = await getRideService.execute(rideId);
    if (ride) {
      res.json(ride);
    } else {
      res.status(404).json({ error: "Ride not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/rides/:rideId/accept", async (req: Request, res: Response) => {
  try {
    const rideId = req.params.rideId;
    const driverId = req.body.driverId;
    await acceptRideService.execute(rideId, driverId);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
