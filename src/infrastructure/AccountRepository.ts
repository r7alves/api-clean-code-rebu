import pgp, { IDatabase } from "pg-promise";
import { SignUpInput } from '../domain/signup';
import { Account } from "../domain/account";
import { IAccountRepository } from "./contract/IAccountRepository";

export class AccountRepository implements IAccountRepository {
  private connection: IDatabase<any>;

  constructor(connection: IDatabase<any>) {
    this.connection = connection;
  }

  async findByEmail(email: string): Promise<any> {
    const [existingAccount] = await this.connection.query("select * from cccat15.account where email = $1", [email]);
    return existingAccount;
  }

  async createAccount(input: SignUpInput): Promise<void> {
    await this.connection.query("insert into cccat15.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)",
      [input.accountId, input.name, input.email, input.cpf, input.carPlate, !!input.isPassenger, !!input.isDriver]);
  }

  async getAccount(accountId: string): Promise<Account | null> {
    const [account] = await this.connection.query("select * from cccat15.account where account_id = $1", [accountId]);
    return account || null;
  }

  async checkDriver(accountId: string): Promise<boolean> {
    const [account] = await this.connection.query("SELECT * FROM cccat15.account WHERE account_id = $1", [accountId]);
    return !!account && account.is_driver;
  }

  async closeConnection(): Promise<void> {
    await this.connection.$pool.end();
  }
}
