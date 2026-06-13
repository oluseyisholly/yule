// src/common/context/request-context.ts
import { AsyncLocalStorage } from 'async_hooks';
import { UnauthorizedException } from '@nestjs/common';

export interface ContextData {
  userId?: string;
  currentContactId?: string;
  role?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<ContextData>();

export class RequestContext {
  static run<T>(data: ContextData, callback: () => T): T {
    return asyncLocalStorage.run(data, callback);
  }

  static get<T extends keyof ContextData>(key: T): ContextData[T] | undefined {
    return asyncLocalStorage.getStore()?.[key];
  }

  static set<T extends keyof ContextData>(key: T, value: ContextData[T]) {
    const store = asyncLocalStorage.getStore();

    if (store) {
      store[key] = value;
    }
  }

  static getCurrentUserId(): string {
    const userId = this.get('userId');

    console.log('Retrieving current user ID from context:', userId);

    if (!userId) {
      throw new UnauthorizedException('Authenticated user id is missing');
    }

    return userId;
  }

  static getCurrentContactId(): string {
    const currentContactId = this.get('currentContactId');

    if (!currentContactId) {
      throw new UnauthorizedException('Authenticated contact id is missing');
    }

    return currentContactId;
  }

  static getActorId(): string | undefined {
    return this.get('currentContactId') ?? this.get('userId');
  }
}
