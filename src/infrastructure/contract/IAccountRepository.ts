import { Account } from "../../domain/account";
import { SignUpInput } from "../../domain/signup";

export interface IAccountRepository {
    findByEmail(email: string): Promise<any>;
    createAccount(input: SignUpInput): Promise<void>;
    getAccount(accountId: string): Promise<Account | null>;
    checkDriver(accountId: string): Promise<boolean>;
    closeConnection(): Promise<void>;
}