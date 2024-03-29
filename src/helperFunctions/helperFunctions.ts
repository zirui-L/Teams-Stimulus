import {
  Channel,
  storedUser,
  Message,
  getData,
  storedMessage,
  Dm,
  ReactReturn,
} from '../dataStore';
import fs from 'fs';
import crypto from 'crypto';
const Jimp = require('jimp');

export const OK = 200;
export const BAD_REQUEST = 400;
export const FORBIDDEN = 403;

import { port, url } from '../config.json';
export const SERVER_URL = `${url}:${port}`;

export const SECRET = 'SECRETSTRING';

/**
 * <For persistence measure, which store data of server into a json file>
 *
 * @param N/A
 *
 * @returns N/A
 */
export const storeData = () => {
  const data = getData();
  if (fs.existsSync('src/data.json')) {
    fs.unlinkSync('src/data.json');
  }
  fs.writeFileSync('src/data.json', JSON.stringify(data), { flag: 'w' });
};

/**
 * <Create a unique id by utilise combination of timestampe and random number,
 * which avoid repetition and collision>
 *
 * @param N/A
 *
 * @returns {number} - returns a unique id
 */
export const createUniqueId = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 100);
  const id = parseInt(`${timestamp}${randomNum}`);
  return id;
};

// Create hash of a string using 'sha256' method
export function getHashOf(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

// Determine whether a name has length between 1 and 50 inclusive
export const nameInRange = (name: string) => {
  return !(name.length < 1 || name.length > 50);
};

// Determine whether a email is registed in the system or not
export const isAvaliableEmail = (email: string, users: any) => {
  for (const user of users) {
    if (user.email === email && !user.isRemoved) {
      return false;
    }
  }
  return true;
};

/**
 * <Create a unique handler string according to user names>
 *
 * @param {string} nameFirst - first name of the registered users
 * @param {string} nameLast - last name of the registered users
 *
 * @returns {handleString} - returns a unique handler string
 */
export const generateHandleStr = (
  nameFirst: string,
  nameLast: string
) => {
  let handleString = nameFirst.toLowerCase() + nameLast.toLowerCase();

  handleString = handleString.replace(/[^0-9a-z]/gi, '');

  if (handleString.length > 20) {
    handleString = handleString.substr(0, 20);
  }

  if (!isAvaliableHandleString(handleString)) {
    let numberCat = 0;
    let newhandleString = handleString;
    while (!isAvaliableHandleString(newhandleString)) {
      newhandleString = handleString + numberCat.toString();
      numberCat += 1;
    }
    return newhandleString;
  }

  return handleString;
};

// Search up the dataStore to see if a handler string already exist or not
export const isAvaliableHandleString = (newHandleStr: string) => {
  const data = getData();

  for (const user of data.users) {
    if (user.handleStr === newHandleStr && !user.isRemoved) {
      return false;
    }
  }
  return true;
};

/**
 * <Check whether a user is registed>
 *
 * @param {number} authUserId - user id of the enquiring user
 *
 * @returns {true} - if user with such authUserId is registered
 * @returns {false} - if user with such authUserId is not registered
 */
export const isAuthUserIdValid = (authUserId: number) => {
  const data = getData();
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      return true;
    }
  }

  return false;
};

/**
 * <Check whether a token is valid or not>
 *
 * @param {string} token - user id of the enquiring user
 *
 * @returns {true} - if user with such token is logged in
 * @returns {false} - if user with such token is not logged in
 */
export const isTokenValid = (token: string) => {
  const data = getData();
  for (const existingtoken of data.tokens) {
    if (getHashOf(existingtoken.token + SECRET) === token) {
      return existingtoken.token;
    }
  }

  return undefined;
};

/**
 * <Check whether a channel is registed>
 *
 * @param {number} channelId - channel id
 *
 * @returns {true} - if the channel with such channelId is registered
 * @returns {false} - if the channel with such channelId is not registered
 */
export const isChannelValid = (channelId: number) => {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return true;
    }
  }

  return false;
};

/**
 * <Check whether a dm is registed>
 *
 * @param {number} dmId - channel id
 *
 * @returns {true} - if the dm with such dmId is registered
 * @returns {false} - if the dm with such dmId is not registered
 */
export const isDmValid = (dmId: number) => {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      return true;
    }
  }
  return false;
};

/**
 * <Check if a specific user belong to a channel>
 *
 * @param {string} authUserId - user id of the enquiring user
 * @param {string} channelId - channel id
 *
 * @returns {true} - user belong to a channel (in allMember)
 * @returns {false} - user doesn't belong to a channel
 *
 */
export const isMember = (authUserId: number, channelId: number) => {
  const data = getData();
  const channelIndex = data.channels.findIndex(
    (channel) => channel.channelId === channelId
  );

  return data.channels[channelIndex].allMembers.includes(authUserId);
};

/**
 * <Check if a specific user belong to a channel>
 *
 * @param {string} messageId - unique id of the messageId
 *
 * @returns {true} - if there exist message with such messageId
 * @returns {false} - if there doesn't exist message with such messageId
 *
 */
export const isMessageValid = (messageId: number) => {
  const data = getData();
  for (const message of data.messages) {
    if (message.messageId === messageId && message.isSent) {
      return true;
    }
  }

  return false;
};

/**
 * <Check if a specific user is an owner of the channel>
 *
 * @param {string} authUserId - user id of the enquiring user
 * @param {string} channelId - channel id
 *
 * @returns {true} - user is a owner of the channel
 * @returns {false} - user doesn't belong to a channel
 *
 */
export const isOwner = (authUserId: number, channelId: number) => {
  const channel = findChannel(channelId);
  return channel.ownerMembers.includes(authUserId);
};

/**
 * <Check if a specific user is an owner of the dm>
 *
 * @param {string} authUserId - user id of the enquiring user
 * @param {string} dmId - dm id
 *
 * @returns {true} - user is a owner of the dm
 * @returns {false} - user doesn't belong to a dm
 *
 */
export const isDmOwner = (authUserId: number, dmId: number) => {
  const dm = findDm(dmId);
  return dm.ownerMembers.includes(authUserId);
};

/**
 * <Find a user object with given authUserId>
 *
 * @param {number} authUserId - user id of the enquiring user
 *
 * @returns {storedUser} - if there exist a user with given authUserId
 * @returns { undefined } - if there doesn't exist a user with given authUserId
 */
export const findUser = (authUserId: number) => {
  const data = getData();
  return data.users.find((user) => user.authUserId === authUserId);
};

/**
 * <Find a channel object with given channelId>
 *
 * @param {number} channelId - channel id
 *
 * @returns { Channel } - if there exist a channel with given channelId
 * @returns { undefined } - if there doesn't exist a channel with given
 * channelId
 */
export const findChannel = (channelId: number) => {
  const data = getData();
  return data.channels.find((channel) => channel.channelId === channelId);
};

/**
 * <Find a channel object with given channelId>
 *
 * @param {number} dmId - dm id
 *
 * @returns { Dm } - if there exist a dm with given channelId
 * @returns { undefined } - if there doesn't exist a channel with given
 * channelId
 */
export const findDm = (dmId: number) => {
  const data = getData();
  return data.dms.find((dm) => dm.dmId === dmId);
};

/**
 * <Find a user id with given token>
 *
 * @param {string} token - token for the user
 *
 * @returns { uId } - if there exist a user with given token
 * @returns { undefined } - if there doesn't exist a user with given
 * token
 */
export const findUserFromToken = (token: string) => {
  const data = getData();
  return data.tokens.find((existingtoken) => existingtoken.token === token).uId;
};

/**
 * <Find a message with given message id>
 *
 * @param {number} messageId - id for the message
 *
 * @returns {Message} - if there exist a message with given id
 */
export const findMessageFromId = (uId: number, messageId: number) => {
  const data = getData();
  const message = data.messages.find(
    (existingMessage) => existingMessage.messageId === messageId
  );

  return {
    messageId: message.messageId,
    uId: message.uId,
    message: message.message,
    timeSent: message.timeSent,
    reacts: getReacts(uId, message),
    isPinned: message.isPinned,
  };
};

export const getReacts = (
  uId: number,
  message: Message
) => {
  const reactsReturn = [];
  for (const react of message.reacts) {
    let isThisUserReacted = false;
    if (react.uIds.includes(uId)) isThisUserReacted = true;
    reactsReturn.push({
      reactId: react.reactId,
      uIds: react.uIds,
      isThisUserReacted: isThisUserReacted,
    });
  }
  return reactsReturn;
};

/**
 * <Check if uIds in the given array are valid>
 *
 * @param {Array<number>} uIds - an array of user id
 *
 * @returns {true} - all uIds are valid
 * @returns {false} - there exists invalid uId
 *
 */
export const isUIdsValid = (uIds: Array<number>) => {
  for (const uId of uIds) {
    if (!isAuthUserIdValid(uId)) {
      return false;
    }
  }
  return true;
};

/**
 * <Check if there exists duplicate elements in a given array>
 *
 * @param {Array<number>} uId - Array of user id
 *
 * @returns {true} - there exists duplicate elements in the array
 * @returns {false} - the array has no duplicate elements
 *
 */
export const isDuplicate = (uIds: Array<number>) => {
  for (let i = 0; i < uIds.length; i++) {
    for (let j = i + 1; j < uIds.length; j++) {
      if (uIds[i] === uIds[j]) return true;
    }
  }
  return false;
};

export const isDmMember = (UId: number, dmId: number) => {
  const dm = findDm(dmId);
  return dm.allMembers.includes(UId);
};

/**
 * <Find a message in stored formate with given message id>
 *
 * @param {number} messageId - id for the message
 *
 * @returns {Message} - if there exist a message with given id
 */
export const findStoredMessageFromId = (messageId: number) => {
  const data = getData();
  const message = data.messages.find(
    (existingMessage) => existingMessage.messageId === messageId
  );

  return message;
};

// return whether a react is valid or not
export const isReactIdValid = (reactId: number) => {
  const data = getData();
  return data.reactIds.includes(reactId);
};

// crop the image to desired dimension
export async function configureImgSize(
  imgUrl: string,
  imgPath: string,
  xStart: number,
  yStart: number,
  width: number,
  height: number
) {
  const image = await Jimp.read(imgUrl);
  await image.crop(xStart, yStart, width, height).write(imgPath);
}

//  get the time now in seconds
export const getTimeNow = () => Math.floor(Date.now() / 1000);
