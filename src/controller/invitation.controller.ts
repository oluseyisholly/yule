import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StandardResopnse } from 'src/common';
import { SwaggerApiEnumTags } from 'src/common/index.enum';
import { Public } from 'src/decorators/skipAuth.decorator';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import {
  ClaimInvitationDto,
  ClaimInvitationResponseEnvelopeDto,
  FindInvitationsQueryDto,
  InvitationResponseDto,
  PaginatedInvitationsResponseEnvelopeDto,
  PublicInvitationResponseEnvelopeDto,
  SendGiftingEventInvitationsDto,
  SendInvitationDto,
  SendInvitationResponseEnvelopeDto,
  SendInvitationsResponseDto,
  SendInvitationsResponseEnvelopeDto,
  SendWishlistEventInvitationsDto,
} from 'src/dtos/invitation.dto';
import { InvitationService } from 'src/services/invitation.service';

@Controller()
@ApiTags(SwaggerApiEnumTags.INVITATION)
@ApiBearerAuth()
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('draw-name-event/:drawNameEventId/invitations/send')
  @ApiOperation({ summary: 'Send invitations for a draw name event' })
  @ApiParam({ name: 'drawNameEventId', type: String })
  @ApiOkResponse({
    description: 'Invitations sent successfully',
    type: SendInvitationsResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid participant contact details' })
  @ApiNotFoundResponse({ description: 'Draw name event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  sendDrawNameEventInvitations(
    @Param('drawNameEventId') drawNameEventId: string,
    @Body() sendInvitationDto: SendInvitationDto,
  ): Promise<StandardResopnse<SendInvitationsResponseDto>> {
    return this.invitationService.sendDrawNameEventInvitations(
      drawNameEventId,
      sendInvitationDto,
    );
  }

  @Post('wishlist-event/:wishlistEventId/invitations/send')
  @ApiOperation({ summary: 'Send invitations for a wishlist event' })
  @ApiParam({ name: 'wishlistEventId', type: String })
  @ApiOkResponse({
    description: 'Invitations sent successfully',
    type: SendInvitationsResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid contact details' })
  @ApiNotFoundResponse({ description: 'Wishlist event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  sendWishlistEventInvitations(
    @Param('wishlistEventId') wishlistEventId: string,
    @Body() sendInvitationDto: SendWishlistEventInvitationsDto,
  ): Promise<StandardResopnse<SendInvitationsResponseDto>> {
    return this.invitationService.sendWishlistEventInvitations(
      wishlistEventId,
      sendInvitationDto,
    );
  }

  @Post('gifting-event/:giftingEventId/invitations/send')
  @ApiOperation({ summary: 'Send invitations for a gifting event' })
  @ApiParam({ name: 'giftingEventId', type: String })
  @ApiOkResponse({
    description: 'Invitations sent successfully',
    type: SendInvitationsResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid contact details' })
  @ApiNotFoundResponse({ description: 'Gifting event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  sendGiftingEventInvitations(
    @Param('giftingEventId') giftingEventId: string,
    @Body() sendInvitationDto: SendGiftingEventInvitationsDto,
  ): Promise<StandardResopnse<SendInvitationsResponseDto>> {
    return this.invitationService.sendGiftingEventInvitations(
      giftingEventId,
      sendInvitationDto,
    );
  }

  @Post('participant/:participantId/invitation/send')
  @ApiOperation({ summary: 'Send invitation to one participant' })
  @ApiParam({ name: 'participantId', type: String })
  @ApiCreatedResponse({
    description: 'Invitation sent successfully',
    type: SendInvitationResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid participant contact details' })
  @ApiNotFoundResponse({ description: 'Participant not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  sendParticipantInvitation(
    @Param('participantId') participantId: string,
    @Body() sendInvitationDto: SendInvitationDto,
  ): Promise<StandardResopnse<InvitationResponseDto>> {
    return this.invitationService.sendParticipantInvitation(
      participantId,
      sendInvitationDto,
    );
  }

  @Get('draw-name-event/:drawNameEventId/invitations')
  @ApiOperation({ summary: 'Get paginated draw name event invitations' })
  @ApiParam({ name: 'drawNameEventId', type: String })
  @ApiOkResponse({
    description: 'Invitations fetched successfully',
    type: PaginatedInvitationsResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Draw name event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findDrawNameEventInvitations(
    @Param('drawNameEventId') drawNameEventId: string,
    @Query() query: FindInvitationsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<InvitationResponseDto>>> {
    return this.invitationService.findDrawNameEventInvitations(
      drawNameEventId,
      query,
    );
  }

  @Get('wishlist-event/:wishlistEventId/invitations')
  @ApiOperation({ summary: 'Get paginated wishlist event invitations' })
  @ApiParam({ name: 'wishlistEventId', type: String })
  @ApiOkResponse({
    description: 'Invitations fetched successfully',
    type: PaginatedInvitationsResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Wishlist event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findWishlistEventInvitations(
    @Param('wishlistEventId') wishlistEventId: string,
    @Query() query: FindInvitationsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<InvitationResponseDto>>> {
    return this.invitationService.findWishlistEventInvitations(
      wishlistEventId,
      query,
    );
  }

  @Get('gifting-event/:giftingEventId/invitations')
  @ApiOperation({ summary: 'Get paginated gifting event invitations' })
  @ApiParam({ name: 'giftingEventId', type: String })
  @ApiOkResponse({
    description: 'Invitations fetched successfully',
    type: PaginatedInvitationsResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Gifting event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findGiftingEventInvitations(
    @Param('giftingEventId') giftingEventId: string,
    @Query() query: FindInvitationsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<InvitationResponseDto>>> {
    return this.invitationService.findGiftingEventInvitations(
      giftingEventId,
      query,
    );
  }

  @Public()
  @Get('invitations/:token')
  @ApiOperation({ summary: 'Get invitation details by token' })
  @ApiParam({ name: 'token', type: String })
  @ApiOkResponse({
    description: 'Invitation fetched successfully',
    type: PublicInvitationResponseEnvelopeDto,
  })
  @ApiNotFoundResponse({ description: 'Invitation not found' })
  findInvitationByToken(
    @Param('token') token: string,
  ): Promise<
    StandardResopnse<InvitationResponseDto & { redirectPath: string }>
  > {
    return this.invitationService.findInvitationByToken(token);
  }

  @Public()
  @Post('invitations/:token/claim')
  @ApiOperation({
    summary: 'Claim invitation and link the participant contact',
  })
  @ApiParam({ name: 'token', type: String })
  @ApiOkResponse({
    description: 'Invitation claimed successfully',
    type: ClaimInvitationResponseEnvelopeDto,
  })
  @ApiBadRequestResponse({ description: 'Invitation cannot be claimed' })
  @ApiNotFoundResponse({ description: 'Invitation not found' })
  claimInvitation(
    @Param('token') token: string,
    @Body() claimInvitationDto: ClaimInvitationDto,
  ) {
    return this.invitationService.claimInvitation(token, claimInvitationDto);
  }
}
