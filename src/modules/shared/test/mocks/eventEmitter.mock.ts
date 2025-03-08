import { EventEmitter2 } from '@nestjs/event-emitter';

export const emit: jest.Mock = jest.fn();
export const on: jest.Mock = jest.fn();
export const once: jest.Mock = jest.fn();
export const off: jest.Mock = jest.fn();
export const removeListener: jest.Mock = jest.fn();
export const removeAllListeners: jest.Mock = jest.fn();

export const fakeEventEmitter2 = <EventEmitter2>(<unknown>{
  emit,
  on,
  once,
  off,
  removeListener,
  removeAllListeners,
});
