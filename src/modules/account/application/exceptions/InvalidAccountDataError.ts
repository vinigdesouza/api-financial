export class InvalidAccountDataError extends Error {
  constructor(message?: string) {
    if (message) {
      super(message);
      return;
    }
    super('Invalid account data');
  }
}
