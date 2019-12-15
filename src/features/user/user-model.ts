
import mongoose from "mongoose";

import * as crypto from "../../services/crypto";

import log from "../../services/logger";



export type UserDocument = mongoose.Document & {
  email: string,
  password: string,
  passwordResetToken: string,
  passwordResetExpires: Date,
  tenantID: string;

  facebook: string,
  tokens: AuthToken[],

  profile: {
    name: string,
    gender: string,
    location: string,
    website: string,
    picture: string
  },

  createTenantID: () => void,

  comparePassword: (candidatePassword: string, cb: (err: any, isMatch: any) => void) => void,
  gravatar: (size: number) => string
};

export type AuthToken = {
  accessToken: string,
  kind: string
};

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  tenantID: String,

  facebook: String,
  twitter: String,
  google: String,
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }],
  profile: {
    name: String,
    gender: String,
    location: String,
    website: String,
    picture: String
  }
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre<UserDocument>("save", function save(next) {
  const user = this;

  if (user.isModified("password")) {
    log.debug("user-model.userSchema.preSave password modified");
    crypto.hash(user.password, (err, result) => {
      if (err) { log.debug("user-model.userSchema.preSave hash error"); return next(err); }
      log.debug("user-model.userSchema.preSave hash=[" + result + "]");
      user.password = result; // hashed password
      next();
    });
  } else {
    log.debug("user-model.userSchema.preSave: password not modified");
    next();
  }
});

userSchema.methods.comparePassword = function (candidatePassword: string, cb: (err: any, isMatch: boolean) => void) {
  const user = this;
  log.debug("user-model.userSchema.methods.comparePassword: candidate: " + candidatePassword + ", password: " + user.password);
  crypto.compare(candidatePassword, user.password, cb);
};

userSchema.methods.createTenantID = function () {
  const user = this;
  user.tenantID = user.id;
};


// export const User: UserType = mongoose.model<UserType>('User', userSchema);
const User: mongoose.Model<UserDocument> = mongoose.model<UserDocument>("User", userSchema);
export default User;