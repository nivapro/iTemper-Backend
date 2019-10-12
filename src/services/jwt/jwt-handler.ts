import * as jwt from "jsonwebtoken";
import log from "../logger";


import { JWT_SECRET } from "../config";

const JWT_SIGN_OPTION = { expiresIn: "10d", issuer: "iTemper"};

export  interface Payload {
    sub: string;
    tenantID: string;
}
export let createPayload = (sub: string, tenantID: string): Payload => {
    return {sub, tenantID};
};

export let signJWT = (payload: Payload): Promise<string> => {
    return new Promise ((resolve, reject) => {
        jwt.sign(payload, JWT_SECRET, JWT_SIGN_OPTION , (err: object, token: string) => {
            if (err)
                reject(err);
            else {
                resolve (token);
            }
        }
        );
    });

};

export type payloadCallback = (err: object, payload: Payload | undefined) => void;

export let verifyJWT = (token: string): Promise<Payload> => {
    return new Promise ((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err: any, pl: object) => {
            if (err)
                reject(err);
            else {
                resolve (<Payload> pl);
            }
        });
    });
};

