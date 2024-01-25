"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../../clients/db");
const jwt_1 = __importDefault(require("../../services/jwt"));
//this resolver willl take the google OAuth token and verify it and then return our own jwt token with only email and id as the payload
const queries = {
    verifyGoogleToken: (parent, { token }) => __awaiter(void 0, void 0, void 0, function* () {
        //remember the GOOGLE OAUTH TOKEN is short lived so can cause errors during testing
        const googleToken = token; //this token is the jwt token that we wll get after logging in the site
        const googleOauthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
        //console.log(googleOauthURL)
        googleOauthURL.searchParams.append("id_token", googleToken); ///adding the jwt token to the search param
        //this data wil contain all the data of the user
        const { data } = yield axios_1.default.get(googleOauthURL.toString(), { responseType: "json" }); //making the request to google oauth server
        //console.log(data)
        //check if user is present already in database or not
        const user = yield db_1.prismaClient.user.findUnique({ where: { email: data.email } });
        //if user is not present in database then create one
        if (!user) {
            yield db_1.prismaClient.user.create({
                data: {
                    email: data.email,
                    firstName: data.given_name || '', // Provide a default value if data.given_name is undefined
                    lastName: data.family_name,
                    profileImageURL: data.picture,
                },
            });
        }
        const userInDb = yield db_1.prismaClient.user.findUnique({ where: { email: data.email } });
        if (!userInDb) {
            throw new Error("User with email not found");
        }
        const userToken = yield jwt_1.default.generateTokenForUser(userInDb);
        return userToken;
    })
};
exports.resolvers = { queries };
