import MailerGateway from '../MailerGateway';
import { SignUpInput, ValidationResult, validateSignUpInput } from '../domain/signup';
import { IAccountRepository } from '../infrastructure/contract/IAccountRepository';

export class SignupService {
  private accountRepository: IAccountRepository;

  constructor(accountRepository: IAccountRepository) {
    this.accountRepository = accountRepository;
  }

  async execute(input: SignUpInput): Promise<any> {
    const validation: ValidationResult = await validateSignUpInput(input);
    if (!validation.valid) {
      return { error: validation.message };
    }
    const existingAccount = await this.accountRepository.findByEmail(input.email);
    if (!existingAccount) {
      input.accountId = crypto.randomUUID();
      await this.accountRepository.createAccount(input);
      const mailerGateway = new MailerGateway();
      mailerGateway.send("Welcome", input.email, "use this link to confirm to account")
      return { accountId: input.accountId };
    } else {
      return { error: "Account already exists" };
    }
  }
}
