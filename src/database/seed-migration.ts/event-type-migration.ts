import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedEventTypes1730000000000 implements MigrationInterface {
  name = 'SeedEventTypes1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const eventTypes = [
      {
        name: 'Birthdays',
        key: 'birthdays',
        description:
          'Celebrate birthdays with gifts, wishlists, or group gifting.',
        isActive: true,
      },
      {
        name: 'Kids Birthdays',
        key: 'kids_birthdays',
        description:
          'Birthday events for children with gifts, games, and wishlists.',
        isActive: true,
      },
      {
        name: 'Milestone Birthdays',
        key: 'milestone_birthdays',
        description:
          'Celebrate special birthday milestones such as 18th, 21st, 30th, 40th, or 50th birthdays.',
        isActive: true,
      },
      {
        name: 'Surprise Birthdays',
        key: 'surprise_birthdays',
        description: 'Plan surprise birthday gifts or group celebrations.',
        isActive: true,
      },
      {
        name: 'Valentines',
        key: 'valentines',
        description:
          'Create Valentine gift exchanges or direct gifting events.',
        isActive: true,
      },
      {
        name: 'Couples Gift Exchange',
        key: 'couples_gift_exchange',
        description: 'Gift exchange events for couples and romantic partners.',
        isActive: true,
      },
      {
        name: 'Friendship Valentines',
        key: 'friendship_valentines',
        description: 'Valentine-style gifting for friends and close groups.',
        isActive: true,
      },
      {
        name: 'Love Notes and Gifts',
        key: 'love_notes_and_gifts',
        description: 'Send gifts, notes, or surprises to someone special.',
        isActive: true,
      },
      {
        name: 'Work Anniversaries',
        key: 'work_anniversaries',
        description: 'Celebrate colleagues for their work milestones.',
        isActive: true,
      },
      {
        name: 'Employee Recognition',
        key: 'employee_recognition',
        description:
          'Recognise employees or colleagues with appreciation gifts.',
        isActive: true,
      },
      {
        name: 'Promotion Celebration',
        key: 'promotion_celebration',
        description: 'Celebrate someone’s promotion with gifts or messages.',
        isActive: true,
      },
      {
        name: 'Retirement Celebration',
        key: 'retirement_celebration',
        description:
          'Celebrate a retiring colleague with gifts and appreciation.',
        isActive: true,
      },
      {
        name: 'Farewell Gifts',
        key: 'farewell_gifts',
        description:
          'Organise farewell gifts for someone leaving a team or organisation.',
        isActive: true,
      },
      {
        name: 'Team Appreciation',
        key: 'team_appreciation',
        description: 'Create appreciation events for teams or departments.',
        isActive: true,
      },
      {
        name: 'Teachers Day',
        key: 'teachers_day',
        description: 'Organise appreciation gifts for teachers.',
        isActive: true,
      },
      {
        name: 'Teacher Appreciation',
        key: 'teacher_appreciation',
        description: 'Collect gifts, messages, or contributions for teachers.',
        isActive: true,
      },
      {
        name: 'School Staff Appreciation',
        key: 'school_staff_appreciation',
        description: 'Appreciate school staff with gifts or group messages.',
        isActive: true,
      },
      {
        name: 'End of School Year Gifts',
        key: 'end_of_school_year_gifts',
        description:
          'Organise gifts for teachers or school staff at the end of the school year.',
        isActive: true,
      },
      {
        name: 'Girls Day',
        key: 'girls_day',
        description:
          'Celebrate girls with gifts, messages, or group activities.',
        isActive: true,
      },
      {
        name: 'Women Appreciation',
        key: 'women_appreciation',
        description:
          'Celebrate women with gifts, recognition, or appreciation messages.',
        isActive: true,
      },
      {
        name: 'Ladies Hangout',
        key: 'ladies_hangout',
        description: 'Create a gift or activity event for a ladies group.',
        isActive: true,
      },
      {
        name: 'Mother and Daughter Day',
        key: 'mother_and_daughter_day',
        description: 'Celebrate mothers and daughters with thoughtful gifts.',
        isActive: true,
      },
      {
        name: 'Weddings and Wedding Anniversaries',
        key: 'weddings',
        description: 'Create wedding or anniversary gift events.',
        isActive: true,
      },
      {
        name: 'Wedding Gifts',
        key: 'wedding_gifts',
        description: 'Organise gifts for a wedding couple.',
        isActive: true,
      },
      {
        name: 'Wedding Anniversary',
        key: 'wedding_anniversary',
        description: 'Celebrate a couple’s wedding anniversary with gifts.',
        isActive: true,
      },
      {
        name: 'Bridal Shower',
        key: 'bridal_shower',
        description: 'Create gift events for a bride before the wedding.',
        isActive: true,
      },
      {
        name: 'Engagement Gifts',
        key: 'engagement_gifts',
        description:
          'Celebrate an engagement with gifts or group contributions.',
        isActive: true,
      },
      {
        name: 'Housewarming for Couple',
        key: 'housewarming_for_couple',
        description: 'Organise gifts for a couple moving into a new home.',
        isActive: true,
      },
      {
        name: 'Religious Holidays',
        key: 'religious_holidays',
        description:
          'Create gift events for Christmas, Eid, Easter, and other religious holidays.',
        isActive: true,
      },
      {
        name: 'Christmas Gifts',
        key: 'christmas_gifts',
        description:
          'Create Christmas gift exchanges, wishlists, or group gifting events.',
        isActive: true,
      },
      {
        name: 'Secret Santa',
        key: 'secret_santa',
        description:
          'Randomly assign participants to give gifts during Christmas or festive periods.',
        isActive: true,
      },
      {
        name: 'Eid Gifts',
        key: 'eid_gifts',
        description: 'Create gift events for Eid celebrations.',
        isActive: true,
      },
      {
        name: 'Easter Gifts',
        key: 'easter_gifts',
        description:
          'Create Easter gift events for family, friends, or groups.',
        isActive: true,
      },
      {
        name: 'Ramadan Gifts',
        key: 'ramadan_gifts',
        description:
          'Organise gifts, support packages, or group giving during Ramadan.',
        isActive: true,
      },
      {
        name: 'Thanksgiving Gifts',
        key: 'thanksgiving_gifts',
        description:
          'Create appreciation and gifting events around Thanksgiving.',
        isActive: true,
      },
      {
        name: 'Direct Gifting',
        key: 'direct_gifting',
        description: 'Create a gift event for one specific person.',
        isActive: true,
      },
      {
        name: 'Group Gifting',
        key: 'group_gifting',
        description:
          'Allow multiple people to contribute towards a gift for someone.',
        isActive: true,
      },
      {
        name: 'Wishlist',
        key: 'wishlist',
        description:
          'Allow a participant to create or receive gifts from a wishlist.',
        isActive: true,
      },
      {
        name: 'Wishlist Exchange',
        key: 'wishlist_exchange',
        description:
          'Participants share wishlists and others pick gifts from them.',
        isActive: true,
      },
      {
        name: 'Draw Names',
        key: 'draw_names',
        description:
          'Participants are randomly assigned to give gifts to one another.',
        isActive: true,
      },
      {
        name: 'Random Gift Exchange',
        key: 'random_gift_exchange',
        description:
          'Randomly assign gift recipients among a group of participants.',
        isActive: true,
      },
      {
        name: 'Auto Gifting',
        key: 'auto_gifting',
        description:
          'Automatically suggest or assign gifts based on event rules.',
        isActive: true,
      },
      {
        name: 'Baby Shower',
        key: 'baby_shower',
        description:
          'Create gift events for expecting parents or newborn celebrations.',
        isActive: true,
      },
      {
        name: 'Naming Ceremony',
        key: 'naming_ceremony',
        description: 'Organise gifts for a child naming ceremony.',
        isActive: true,
      },
      {
        name: 'Housewarming',
        key: 'housewarming',
        description: 'Create gift events for someone moving into a new home.',
        isActive: true,
      },
      {
        name: 'Graduation',
        key: 'graduation',
        description:
          'Celebrate a graduation with gifts or group contributions.',
        isActive: true,
      },
      {
        name: 'Congratulations',
        key: 'congratulations',
        description:
          'Send gifts to congratulate someone on a personal achievement.',
        isActive: true,
      },
      {
        name: 'Get Well Soon',
        key: 'get_well_soon',
        description:
          'Send care gifts or support packages to someone recovering.',
        isActive: true,
      },
      {
        name: 'Thank You Gifts',
        key: 'thank_you_gifts',
        description:
          'Send appreciation gifts to someone as a thank-you gesture.',
        isActive: true,
      },
      {
        name: 'Apology Gifts',
        key: 'apology_gifts',
        description: 'Send a thoughtful gift as an apology or peace offering.',
        isActive: true,
      },
      {
        name: 'Just Because',
        key: 'just_because',
        description: 'Send a gift without needing a specific occasion.',
        isActive: true,
      },
      {
        name: 'Hangout',
        key: 'hangout',
        description: 'Create casual hangout events with optional gifting.',
        isActive: true,
      },
      {
        name: 'Dinner Party',
        key: 'dinner_party',
        description: 'Organise gifts or contributions around a dinner event.',
        isActive: true,
      },
      {
        name: 'Friends Reunion',
        key: 'friends_reunion',
        description:
          'Create reunion events for friends with gifts or activities.',
        isActive: true,
      },
      {
        name: 'Family Reunion',
        key: 'family_reunion',
        description:
          'Create family reunion events with gifts, games, or group contributions.',
        isActive: true,
      },
      {
        name: 'Community Event',
        key: 'community_event',
        description:
          'Create gifting or contribution events for a community group.',
        isActive: true,
      },
    ];

    const values: unknown[] = [];
    const placeholders = eventTypes
      .map((eventType, index) => {
        const offset = index * 4;

        values.push(
          eventType.name,
          eventType.key,
          eventType.description,
          eventType.isActive,
        );

        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
      })
      .join(', ');

    await queryRunner.query(
      `
        INSERT INTO event_types ("name", "key", "description", "isActive")
        VALUES ${placeholders}
        ON CONFLICT ("key")
        DO UPDATE SET
          "name" = EXCLUDED."name",
          "description" = EXCLUDED."description",
          "isActive" = EXCLUDED."isActive";
      `,
      values,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM event_types
      WHERE "key" IN (
        'birthdays',
        'kids_birthdays',
        'milestone_birthdays',
        'surprise_birthdays',
        'valentines',
        'couples_gift_exchange',
        'friendship_valentines',
        'love_notes_and_gifts',
        'work_anniversaries',
        'employee_recognition',
        'promotion_celebration',
        'retirement_celebration',
        'farewell_gifts',
        'team_appreciation',
        'teachers_day',
        'teacher_appreciation',
        'school_staff_appreciation',
        'end_of_school_year_gifts',
        'girls_day',
        'women_appreciation',
        'ladies_hangout',
        'mother_and_daughter_day',
        'weddings',
        'wedding_gifts',
        'wedding_anniversary',
        'bridal_shower',
        'engagement_gifts',
        'housewarming_for_couple',
        'religious_holidays',
        'christmas_gifts',
        'secret_santa',
        'eid_gifts',
        'easter_gifts',
        'ramadan_gifts',
        'thanksgiving_gifts',
        'direct_gifting',
        'group_gifting',
        'wishlist',
        'wishlist_exchange',
        'draw_names',
        'random_gift_exchange',
        'auto_gifting',
        'baby_shower',
        'naming_ceremony',
        'housewarming',
        'graduation',
        'congratulations',
        'get_well_soon',
        'thank_you_gifts',
        'apology_gifts',
        'just_because',
        'hangout',
        'dinner_party',
        'friends_reunion',
        'family_reunion',
        'community_event'
      );
    `);
  }
}
