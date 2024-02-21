import MailerGateway from "../src/MailerGateway";
import { AccountService } from "../src/application/AccountService";
import { SignupService } from "../src/application/SignupService";
import { AccountRepository } from "../src/infrastructure/AccountRepository";
import { MockAccountRepository } from "../src/infrastructure/MockAccountRepository";
import sinon from 'sinon';

const pgp = require('pg-promise')();
const connection = pgp("postgres://maxter:@localhost:5432/cccat15");

let mockAccountRepository: AccountRepository;
let accountService: AccountService;
let signupService: SignupService;

beforeEach(() => {
  mockAccountRepository = new AccountRepository(connection);
  accountService = new AccountService(mockAccountRepository);
  signupService = new SignupService(mockAccountRepository);
});

afterEach(async () => {
  await mockAccountRepository.closeConnection();
});

test("deve criar a conta de um passageiro", async () => {
  const input = {
    name: "John Doe",
    email: `jonh.doe${Math.random()}@test.com`,
    cpf: "123.123.123-87",
    is_passenger: true,
  };

  const outputSignup = await signupService.execute(input);
  expect(outputSignup.accountId).toBeDefined();
  const outputGetAccount = await accountService.execute(outputSignup.accountId);
  expect(outputGetAccount?.name).toBe(input.name);
  expect(outputGetAccount?.email).toBe(input.email);
});

test("deve criar a conta de um motorista", async () => {
  const input = {
    name: "John Doe",
    email: `jonh.doe${Math.random()}@test.com`,
    cpf: "123.123.123-87",
    is_driver: true,
    car_plate: "NON3042",
  };

  const outputSignup = await signupService.execute(input);
  expect(outputSignup.accountId).toBeDefined();

  const outputGetAccount = await accountService.execute(outputSignup.accountId);
  expect(outputGetAccount?.name).toBe(input.name);
  expect(outputGetAccount?.email).toBe(input.email);
});

test("não deve criar a conta com nome vazio", async () => {
  const input = {
    name: "",
    email: `jonh.doe${Math.random()}@test.com`,
    cpf: "123.123.123-87",
  };

  const outputSignup = await signupService.execute(input);
  expect(outputSignup.error).toBeDefined();
  expect(outputSignup.error).toBe("Invalid name");
});

test("não deve criar a conta com CPF inválido", async () => {
  const input = {
    name: "John Doe",
    email: `jonh.doe${Math.random()}@test.com`,
    cpf: "123.123.123-88",
  };

  const outputSignup = await signupService.execute(input);
  expect(outputSignup.error).toBeDefined();
  expect(outputSignup.error).toBe("Invalid cpf");
});

test("não deve criar a conta com email inválido", async () => {
  const input = {
    name: "John Doe",
    email: `jonh.doe${Math.random()}test.com`,
    cpf: "123.123.123-87",
  };

  const outputSignup = await signupService.execute(input);
  expect(outputSignup.error).toBeDefined();
  expect(outputSignup.error).toBe("Invalid email");
});

test("não deve criar a conta de motorista com placa errada", async () => {
  const input = {
    name: "John Doe",
    email: `jonh.doe${Math.random()}@test.com`,
    cpf: "123.123.123-87",
    isDriver: true,
    car_plate: "NASMR",
  };

  const outputSignup = await signupService.execute(input);
  expect(outputSignup.error).toBeDefined();
  expect(outputSignup.error).toBe("Invalid car plate");
});

test("não deve criar a conta com email já cadastrado", async () => {
  const firstInput = {
    name: "John Doe",
    email: `jonh.doe${Math.random()}@test.com`,
    cpf: "123.123.123-87",
    is_driver: true,
    car_plate: "NAS3054",
  };

  await signupService.execute(firstInput);

  const secondInput = {
    name: "John Doe",
    email: firstInput.email,
    cpf: "123.123.123-87",
  };

  const outputSignupSec = await signupService.execute(secondInput);
  expect(outputSignupSec.error).toBeDefined();
  expect(outputSignupSec.error).toBe("Account already exists");
});

test("deve criar a conta de um passageiro stub", async () => {
  const input = {
    name: "John Doe",
    email: `jonh.doe${Math.random()}@test.com`,
    cpf: "123.123.123-87",
    is_passenger: true,
  };

  const createAccountStub = sinon.stub(AccountRepository.prototype, "createAccount").resolves();
  const findByEmailStub = sinon.stub(AccountRepository.prototype, "findByEmail").resolves();
  const getAccountStub = sinon.stub(AccountRepository.prototype, "getAccount").resolves(input);
  const outputSignup = await signupService.execute(input);
  expect(outputSignup.accountId).toBeDefined();
  const outputGetAccount = await accountService.execute(outputSignup.accountId);
  expect(outputGetAccount?.name).toBe(input.name);
  expect(outputGetAccount?.email).toBe(input.email);
  expect(outputGetAccount?.is_passenger).toBe(input.is_passenger);
  createAccountStub.restore();
  findByEmailStub.restore();
  getAccountStub.restore();
});

test("deve criar a conta de um passageiro spy", async () => {
  const input = {
    name: "John Doe",
    email: `jonh.doe${Math.random()}@test.com`,
    cpf: "123.123.123-87",
    is_passenger: true,
  };

  const createSpy = sinon.spy(AccountRepository.prototype, "createAccount");
  const sendSpy = sinon.spy(MailerGateway.prototype, "send");
  const outputSignup = await signupService.execute(input);
  expect(outputSignup.accountId).toBeDefined();
  const outputGetAccount = await accountService.execute(outputSignup.accountId);
  expect(outputGetAccount?.name).toBe(input.name);
  expect(outputGetAccount?.email).toBe(input.email);
  expect(createSpy.calledOnce).toBe(true);
  expect(createSpy.calledWith(input)).toBe(true);
  expect(sendSpy.calledOnce).toBe(true);
  expect(sendSpy.calledWith("Welcome", input.email, "use this link to confirm to account")).toBe(true);
  createSpy.restore();
  sendSpy.restore();
});

test("deve criar a conta de um passageiro mock", async () => {
  const input = {
    name: "John Doe",
    email: `jonh.doe${Math.random()}@test.com`,
    cpf: "123.123.123-87",
    is_passenger: true,
  };

  const mailerGatewayMock = sinon.mock(MailerGateway.prototype);
  mailerGatewayMock.expects("send").withArgs("Welcome", input.email, "use this link to confirm to account").once();

  const outputSignup = await signupService.execute(input);
  expect(outputSignup.accountId).toBeDefined();
  const outputGetAccount = await accountService.execute(outputSignup.accountId);
  expect(outputGetAccount?.name).toBe(input.name);
  expect(outputGetAccount?.email).toBe(input.email);
  mailerGatewayMock.verify();
  mailerGatewayMock.restore()
});
