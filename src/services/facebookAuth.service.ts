import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: '601142296210478', // Replace with your Facebook App ID
      clientSecret: '6cb1a456449e27020f53ca2b98e6ca4f', // Replace with your Facebook App Secret
      callbackURL: 'http://localhost:3000/auth/facebook/callback', // Replace with your callback URL
      profileFields: ['id', 'emails', 'name'], // Profile fields to request
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {

    const { id, name, emails } = profile;

    
    const user = {
      facebookId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
    };
    return user; // Attach this user object to the request
  }
}
