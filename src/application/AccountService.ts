import { Account } from '../domain/account';
import { IAccountRepository } from '../infrastructure/contract/IAccountRepository';

export class AccountService {
  private accountRepository: IAccountRepository;

  constructor(accountRepository: IAccountRepository) {
    this.accountRepository = accountRepository;
  }

  async execute(accountId: string): Promise<Account | null> {
    const account = await this.accountRepository.getAccount(accountId);
    return account;
  }
}