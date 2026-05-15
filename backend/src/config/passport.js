import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user.model.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    proxy: true
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
                coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop", // A nice default abstract gradient
                isEmailVerified: true
            });
        } else {
            // Sync Google data for existing users
            let needsSave = false;

            if (!user.googleId) {
                user.googleId = profile.id;
                needsSave = true;
            }
            // Always sync the real Google photo for Google users
            if (profile.photos[0]?.value) {
                user.avatar = profile.photos[0].value;
                needsSave = true;
            }
            if (user.provider === 'local') {
                user.provider = 'google';
                needsSave = true;
            }
            if (!user.isEmailVerified) {
                user.isEmailVerified = true;
                needsSave = true;
            }

            if (needsSave) {
                await user.save({ validateBeforeSave: false });
            }
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