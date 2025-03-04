export enum AccountType {
  CONTA_CORRENTE = 'CONTA_CORRENTE',
  CONTA_POUPANCA = 'CONTA_POUPANCA',
}

export class Account {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly accountNumber: number,
    public readonly accountBalance: number,
    public readonly accountType: AccountType,
    public readonly createdAt: Date,
    public readonly updatedAt?: Date,
  ) {}
}
