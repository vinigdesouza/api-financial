import { LoggerService } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export class CustomLogger implements LoggerService {
  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
  ) {}

  verbose(message: string, context?: string) {
    this.logger.trace({ context }, message);
  }

  debug(message: string, context?: string) {
    this.logger.debug({ context }, message);
  }

  log(message: string, context?: string) {
    this.logger.info({ context }, message);
  }

  warn(message: string, context?: string) {
    this.logger.warn({ context }, message);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ context, trace }, message);
  }
}
