export enum SwaggerApiEnumTags {
  APP = 'app',
  USER = 'User',
  EVENTTYPE = 'Event Type',
}

export enum EventParticipantRole {
  CREATOR = 'creator',
  HOST = 'host',
  PARTICIPANT = 'participant',
  RECIPIENT = 'recipient',
}

export enum EventLogAction {
  EVENT_CREATED = 'event_created',
  EVENT_UPDATED = 'event_updated',

  PARTICIPANT_ADDED = 'participant_added',
  PARTICIPANT_REMOVED = 'participant_removed',
  PARTICIPANT_ACCEPTED = 'participant_accepted',

  WISHLIST_ITEM_ADDED = 'wishlist_item_added',
  WISHLIST_ITEM_UPDATED = 'wishlist_item_updated',
  WISHLIST_ITEM_RESERVED = 'wishlist_item_reserved',
  WISHLIST_ITEM_COMPLETED = 'wishlist_item_completed',

  DRAW_NAMES_COMPLETED = 'draw_names_completed',
  GIFT_ITEM_COMPLETED = 'gift_item_completed',
}
