"use strict";
// import createError from "http-errors";
// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { getError, Code } from "../utils/error";
// import { UserRepo } from "../repository/users.repository";
// import { UserRole } from "./enum";
// import { User } from "../interface/User";
// import config from "../config/index";
// if (!config.google.clientIdWeb || !config.google.clientSecret) {
//   throw createError(401, getError(Code.NOT_FOUND_USER));
// }
// const clientID: string = config.google.clientIdWeb;
// const clientSecret: string = config.google.clientSecret;
// const callbackURL = config.google.loginRedirectUrl;
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID,
//       clientSecret,
//       callbackURL,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email: string | null = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
//         const name = profile.displayName || "Unknown Name";
//         if (!email) {
//           return done(null, false, { message: "No email found from Google profile" });
//         }
//         let user = await UserRepo.getUserByEmail(email);
//         console.log("user", user);
//         if (!user) {
//           user = await UserRepo.addUser({
//             email,
//             name,
//             role: UserRole.User,
//             status: "active",
//           });
//         }
//         return done(null, user);
//       } catch (e: any) {
//         return done(e);
//       }
//     }
//   )
// );
// passport.serializeUser((user: any, done) => {
//   done(null, user.email);
// });
// // 세션에서 사용자 식별 정보를 바탕으로 사용자 객체 복구
// passport.deserializeUser(async (email: string, done) => {
//   try {
//     const user = await UserRepo.getUserByEmail(email);
//     console.log("user", user);
//     if (user) {
//       done(null, user as User); // 사용자 객체를 세션에 복구
//     } else {
//       done(createError(401, "User not found"), null); // 사용자를 찾지 못한 경우
//     }
//   } catch (error) {
//     done(error, null);
//   }
// });
//# sourceMappingURL=passport.js.map