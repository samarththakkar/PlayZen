import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user.model.js';

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/users/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ 
            $or: [{ googleId: profile.id }, { email: profile.emails[0].value }] 
        });

        if (!user) {
            const username = profile.emails[0].value.split('@')[0] + Math.random().toString(36).substr(2, 4);
            
            user = await User.create({
                fullname: profile.displayName,
                email: profile.emails[0].value,
                username,
                googleId: profile.id,
                provider: 'google',
                avatar: profile.photos[0]?.value || "",
                coverImage: "",
                isEmailVerified: true
            });
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;