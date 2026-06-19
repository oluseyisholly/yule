import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EventContactService } from 'src/services/event-contact.service';
import { RequestContext } from '../context/requestContext';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly eventContactService: EventContactService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const userId = user?.profileId ?? user?.id;

    return new Observable((subscriber) => {
      const contextData = {
        userId,
        role: user?.role,
      };

      return RequestContext.run(contextData, () => {
        const source$ = userId
          ? from(
              this.eventContactService.ensureCurrentUserContactEntity(
                userId,
                user,
              ),
            ).pipe(switchMap(() => next.handle()))
          : next.handle();

        const subscription = source$.subscribe({
          next: (value) => subscriber.next(value),
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        });

        return () => subscription.unsubscribe();
      });
    });
  }
}
