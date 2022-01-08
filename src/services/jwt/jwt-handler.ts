import * as jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config";

const JWT_SIGN_OPTION = { expiresIn: "10d", issuer: "iTemper"};

export  interface Payload {
    sub: string;
    tenantID: string;
}
export const createPayload = (sub: string, tenantID: string): Payload => {
    return {sub, tenantID};
};

export const signJWT = (payload: Payload): Promise<string> => {
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

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const verifyJWT = (token: string): Promise<Payload> => {
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

