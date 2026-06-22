import { HttpStatus, Injectable } from '@nestjs/common';
import { StandardResopnse } from 'src/common';
import { RequestContext } from 'src/common/context/requestContext';
import { FindParticipatedEventsQueryDto } from 'src/dtos/event.dto';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import { Event } from 'src/entities/event.entity';
import { EventRepository } from 'src/repositories/event.repository';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async findParticipatedEvents(
    query: FindParticipatedEventsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<Event>>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const participatedEvents = await this.eventRepository.findParticipatedEvents(
      query,
      currentContactId,
    );

    return {
      code: HttpStatus.OK,
      message: 'Participated events fetched successfully',
      data: participatedEvents,
    };
  }
}
