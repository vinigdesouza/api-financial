export class BalanceInsufficient extends Error {
  constructor() {
    super('Insufficient balance to make the transaction');
  }
}
