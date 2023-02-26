const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const debug = require("debug")("app:passport");
const User = require("../models/User");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findOne({
        $and: [
          {
            _id: jwt_payload.sub,
          },
          {
            login_sessions: {
              $in: jwt_payload.sessionID,
            },
          },
        ],
      });

      if (user) {
        return done(null, user);
      } else {
        const error = new Error("Illegal request!");
        return done(error, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

module.exports = passport;
