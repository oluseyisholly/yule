import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StandardResopnse } from 'src/common';
import { RequestContext } from 'src/common/context/requestContext';
import { DeleteResponseDto } from 'src/dtos/general.dto';
import {
  CreateRelationshipDto,
  FindRelationshipsQueryDto,
  PaginatedRelationshipsDto,
  RelationshipResponseDto,
  UpdateRelationshipDto,
} from 'src/dtos/relationship.dto';
import { Relationship } from 'src/entities/relationship.entity';
import { RelationshipRepository } from 'src/repositories/relationship.repository';

@Injectable()
export class RelationshipService {
  constructor(
    private readonly relationshipRepository: RelationshipRepository,
  ) {}

  async createRelationship(
    createRelationshipDto: CreateRelationshipDto,
  ): Promise<StandardResopnse<RelationshipResponseDto>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const existingRelationship = await this.relationshipRepository.findByName(
      createRelationshipDto.name,
      currentContactId,
    );

    if (existingRelationship) {
      throw new ConflictException(
        'A relationship with this name already exists',
      );
    }

    const relationship = await this.relationshipRepository.create({
      name: createRelationshipDto.name,
      description: createRelationshipDto.description ?? null,
      isActive: createRelationshipDto.isActive ?? true,
    });

    return {
      code: HttpStatus.CREATED,
      message: 'Relationship created successfully',
      data: relationship,
    };
  }

  async findAllRelationships(
    query: FindRelationshipsQueryDto,
  ): Promise<StandardResopnse<PaginatedRelationshipsDto>> {
    const paginatedRelationships =
      await this.relationshipRepository.findAllRelationships(query);

    return {
      code: HttpStatus.OK,
      message: 'Relationships fetched successfully',
      data: paginatedRelationships,
    };
  }

  async findAvailableRelationships(
    query: FindRelationshipsQueryDto,
  ): Promise<StandardResopnse<PaginatedRelationshipsDto>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const paginatedRelationships =
      await this.relationshipRepository.findAvailableRelationships(
        query,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Available relationships fetched successfully',
      data: paginatedRelationships,
    };
  }

  async findRelationshipById(
    id: string,
  ): Promise<StandardResopnse<RelationshipResponseDto>> {
    const relationship = await this.getRelationshipOrThrow(id);

    return {
      code: HttpStatus.OK,
      message: 'Relationship fetched successfully',
      data: relationship,
    };
  }

  async updateRelationship(
    id: string,
    updateRelationshipDto: UpdateRelationshipDto,
  ): Promise<StandardResopnse<RelationshipResponseDto>> {
    await this.getEditableRelationshipOrThrow(id);
    await this.ensureRelationshipNameIsUnique(updateRelationshipDto.name, id);

    const updatedRelationship = await this.relationshipRepository.update(
      id,
      updateRelationshipDto,
    );

    return {
      code: HttpStatus.OK,
      message: 'Relationship updated successfully',
      data: updatedRelationship,
    };
  }

  async deleteRelationship(
    id: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    await this.getEditableRelationshipOrThrow(id);
    await this.relationshipRepository.delete(id);

    return {
      code: HttpStatus.OK,
      message: 'Relationship deleted successfully',
      data: { id },
    };
  }

  private async getRelationshipOrThrow(id: string): Promise<Relationship> {
    const relationship = await this.relationshipRepository.findById(id);

    if (!relationship) {
      throw new NotFoundException('Relationship not found');
    }

    return relationship;
  }

  private async getEditableRelationshipOrThrow(
    id: string,
  ): Promise<Relationship> {
    const currentContactId = RequestContext.getCurrentContactId();
    const relationship = await this.relationshipRepository.findByIdForUser(
      id,
      currentContactId,
    );

    if (!relationship) {
      throw new NotFoundException('Relationship not found');
    }

    return relationship;
  }

  private async ensureRelationshipNameIsUnique(
    name?: string,
    excludeId?: string,
  ) {
    if (name === undefined) {
      return;
    }

    const currentContactId = RequestContext.getCurrentContactId();
    const duplicateRelationship = await this.relationshipRepository.findByName(
      name,
      currentContactId,
      excludeId,
    );

    if (duplicateRelationship) {
      throw new ConflictException(
        'A relationship with this name already exists',
      );
    }
  }
}
