import { IAccountRepository } from "./contract/IAccountRepository";

export class MockAccountRepository implements IAccountRepository {
  private mockData: any[] = [];
  async findByEmail(email: string): Promise<any> {
    return this.mockData.find(account => account.email === email) || null;
  }
  async createAccount(id: string, input: any): Promise<void> {
    const newAccount = { account_id: id, ...input };
    this.mockData.push(newAccount);
  }
  async getAccount(accountId: string): Promise<any | null> {
    return this.mockData.find(account => account.account_id === accountId) || null;
  }
  async closeConnection(): Promise<void> {}
}
