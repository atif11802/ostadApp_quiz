const passport = require("passport");

module.exports.auth = (req, res, next) =>
  passport.authenticate(
    "jwt",
    {
      session: false,
    },
    (error, user, info) => {
      if (error) {
        return res.status(401).json({
          error: {
            message: error.message,
          },
        });
      } else if (info) {
        return res.status(401).json({
          error: {
            message: info.message,
          },
        });
      } else {
        req.user = user;
        next();
      }
    }
  )(req, res, next);
