export class AccountDoesNotExist extends Error {
  constructor() {
    super('Acount does not exist');
  }
}
