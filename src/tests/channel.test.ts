import {
  requestAuthRegister,
  requestChannelDetails,
  requestChannelInvite,
  requestChannelJoin,
  requestChannelAddOwner,
  requestChannelLeave,
  requestChannelRemoveOwner,
  requestChannelMessages,
  requestChannelsCreate,
  requestChannelsListAll,
  requestClear,
  requestMessageSend,
  requestStandupStart,
  sleep
} from './testHelper';
import { FORBIDDEN, OK, BAD_REQUEST } from '../helperFunctions/helperFunctions';

import { createMessages } from './testHelper';

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

describe('Testing /channel/details/v3', () => {
  test('Test-1: Error, incorrect channelId', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    );
    requestChannelsCreate(test1.bodyObj.token, 'RicardoChannel', true);
    const channelDetails = requestChannelDetails(
      test1.bodyObj.token,
      test1.bodyObj.channelId + 1
    );
    expect(channelDetails.statusCode).toBe(BAD_REQUEST);
    expect(channelDetails.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, invalid token', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    );
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );
    const channelDetails = requestChannelDetails(
      test1.bodyObj.token + 1,
      channelId.bodyObj.channelId
    );
    expect(channelDetails.statusCode).toBe(FORBIDDEN);
    expect(channelDetails.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, User inputed is not in the existing channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    );
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    );
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );
    const channelDetails = requestChannelDetails(
      test2.bodyObj.token,
      channelId.bodyObj.channelId
    );
    expect(channelDetails.statusCode).toBe(FORBIDDEN);
    expect(channelDetails.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4, correct input parameters', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    );
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );
    const channelDetails = requestChannelDetails(
      test1.bodyObj.token,
      channelId.bodyObj.channelId
    );

    expect(channelDetails.statusCode).toBe(OK);
    expect(channelDetails.bodyObj).toStrictEqual({
      name: 'RicardoChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Li',
          handleStr: 'richardoli',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Li',
          handleStr: 'richardoli',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });

  test('Test-5, correct input parameters, but with multiple members', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    );
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    );
    const test3 = requestAuthRegister(
      'test3@gmail.com',
      '12345678',
      'Kunda',
      'Yu'
    );
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channelId.bodyObj.channelId);
    requestChannelJoin(test3.bodyObj.token, channelId.bodyObj.channelId);

    const channelDetails = requestChannelDetails(
      test1.bodyObj.token,
      channelId.bodyObj.channelId
    );

    expect(channelDetails.statusCode).toBe(OK);
    expect(channelDetails.bodyObj).toStrictEqual({
      name: 'RicardoChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Li',
          handleStr: 'richardoli',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Li',
          handleStr: 'richardoli',
          profileImgUrl: expect.any(String),
        },
        {
          uId: test2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'Shenba',
          nameLast: 'Chen',
          handleStr: 'shenbachen',
          profileImgUrl: expect.any(String),
        },
        {
          uId: test3.bodyObj.authUserId,
          email: 'test3@gmail.com',
          nameFirst: 'Kunda',
          nameLast: 'Yu',
          handleStr: 'kundayu',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });
});

describe('Testing /channel/join/v3', () => {
  test('Test-1: Error, channelId does not refer to a valid channel', () => {
    const user1 = requestAuthRegister(
      'ricky@gmail.com',
      '123455',
      'Ricky',
      'Li'
    );

    const user2 = requestAuthRegister(
      'libro@gmail.com',
      '123455',
      'libro',
      'Zhang'
    );

    const channel1 = requestChannelsCreate(
      user2.bodyObj.token,
      'Rickychannel',
      true
    );

    const channelJoinObj = requestChannelJoin(
      user1.bodyObj.token,
      channel1.bodyObj.channelId + 5
    );
    expect(channelJoinObj.statusCode).toBe(BAD_REQUEST);
    expect(channelJoinObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, token is invalid', () => {
    const user1 = requestAuthRegister(
      'ricky@gmail.com',
      '123455',
      'Ricky',
      'Li'
    );

    const channel1 = requestChannelsCreate(
      user1.bodyObj.token,
      'Rickychannel',
      true
    );

    const channelJoinObj = requestChannelJoin(
      user1.bodyObj.token + 1,
      channel1.bodyObj.channelId
    );
    expect(channelJoinObj.statusCode).toBe(FORBIDDEN);
    expect(channelJoinObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, user is already a member of the channel', () => {
    const user1 = requestAuthRegister(
      'ricky@gmail.com',
      '123455',
      'Ricky',
      'Li'
    );

    const channel1 = requestChannelsCreate(
      user1.bodyObj.token,
      'Rickychannel',
      true
    );

    const channelJoinObj = requestChannelJoin(
      user1.bodyObj.token,
      channel1.bodyObj.channelId
    );
    expect(channelJoinObj.statusCode).toBe(BAD_REQUEST);
    expect(channelJoinObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Error, private channel, and user is not a global owner', () => {
    const user1 = requestAuthRegister(
      'ricky@gmail.com',
      '123455',
      'Ricky',
      'Li'
    );

    const user2 = requestAuthRegister(
      'libro@gmail.com',
      '123455',
      'libro',
      'Zhang'
    );

    const channel1 = requestChannelsCreate(
      user1.bodyObj.token,
      'Rickychannel',
      false
    );

    const channelJoinObj = requestChannelJoin(
      user2.bodyObj.token,
      channel1.bodyObj.channelId
    );
    expect(channelJoinObj.statusCode).toBe(FORBIDDEN);
    expect(channelJoinObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-5: successiful case', () => {
    const user1 = requestAuthRegister(
      'ricky@gmail.com',
      '123455',
      'Ricky',
      'Li'
    );

    const user2 = requestAuthRegister(
      'libro@gmail.com',
      '123455',
      'libro',
      'Zhang'
    );
    const channel1 = requestChannelsCreate(
      user1.bodyObj.token,
      'Rickychannel',
      true
    );

    const channelJoinObj = requestChannelJoin(
      user2.bodyObj.token,
      channel1.bodyObj.channelId
    );
    expect(channelJoinObj.statusCode).toBe(OK);
    expect(channelJoinObj.bodyObj).toStrictEqual({});
  });

  test('Test-6: private channel, but the user is a global owner', () => {
    const user1 = requestAuthRegister(
      'ricky@gmail.com',
      '123455',
      'Ricky',
      'Li'
    );

    const user2 = requestAuthRegister(
      'libro@gmail.com',
      '123455',
      'libro',
      'Zhang'
    );
    const channel1 = requestChannelsCreate(
      user2.bodyObj.token,
      'Rickychannel',
      false
    );

    const channelJoinObj = requestChannelJoin(
      user1.bodyObj.token,
      channel1.bodyObj.channelId
    );
    expect(channelJoinObj.statusCode).toBe(OK);
    expect(channelJoinObj.bodyObj).toStrictEqual({});
  });
});

describe('/channel/invite/v3 testing', () => {
  test('Test-1: Error, invalid channelId', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    );

    const channelInviteObj = requestChannelInvite(
      test1.bodyObj.token,
      0,
      test2.bodyObj.authUserId
    );
    expect(channelInviteObj.statusCode).toBe(BAD_REQUEST);
    expect(channelInviteObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, Invalid uIs', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'LeeChannel',
      true
    );

    const channelInviteObj = requestChannelInvite(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId + 1
    );
    expect(channelInviteObj.statusCode).toBe(BAD_REQUEST);
    expect(channelInviteObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, uId belong to a user who is already in the channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    );
    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'LeeChannel',
      true
    );
    requestChannelJoin(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelInviteObj = requestChannelInvite(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelInviteObj.statusCode).toBe(BAD_REQUEST);
    expect(channelInviteObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Error, channelId is valid and the authorised user is not a member of the channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    );
    const test3 = requestAuthRegister(
      'test3@gmail.com',
      '12345678',
      'Kunda',
      'Yu'
    );
    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'LeeChannel',
      true
    );

    const channelInviteObj = requestChannelInvite(
      test2.bodyObj.token,
      channel.bodyObj.channelId,
      test3.bodyObj.authUserId
    );
    expect(channelInviteObj.statusCode).toBe(FORBIDDEN);
    expect(channelInviteObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-5: Error, invalid token', () => {
    const test1 = requestAuthRegister(
      'test@gmail.com',
      '123456',
      'Ricardo',
      'Lee'
    );
    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'LeeChannel',
      true
    );

    const channelInviteObj = requestChannelInvite(
      test1.bodyObj.token + 1,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId
    );
    expect(channelInviteObj.statusCode).toBe(FORBIDDEN);
    expect(channelInviteObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-6: Error, user inviting themselves', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'LeeChannel',
      true
    );

    const channelInviteObj = requestChannelInvite(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId
    );
    expect(channelInviteObj.statusCode).toBe(BAD_REQUEST);
    expect(channelInviteObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-7: Successful invite', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    );
    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'LeeChannel',
      true
    );

    const channelInviteObj = requestChannelInvite(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelInviteObj.statusCode).toBe(OK);
    expect(channelInviteObj.bodyObj).toStrictEqual({});

    const channelDetailObj = requestChannelDetails(
      test1.bodyObj.token,
      channel.bodyObj.channelId
    );

    expect(channelDetailObj.bodyObj).toStrictEqual({
      name: 'LeeChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Lee',
          handleStr: 'richardolee',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Lee',
          handleStr: 'richardolee',
          profileImgUrl: expect.any(String),
        },
        {
          uId: test2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'Shenba',
          nameLast: 'Chen',
          handleStr: 'shenbachen',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });

  test('Test-8: Inviting global owner into the channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    );
    const channel = requestChannelsCreate(
      test2.bodyObj.token,
      'ShenbaChannel',
      false
    );

    const channelInviteObj = requestChannelInvite(
      test2.bodyObj.token,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId
    );
    expect(channelInviteObj.statusCode).toBe(OK);
    expect(channelInviteObj.bodyObj).toStrictEqual({});

    const channelDetailObj = requestChannelDetails(
      test1.bodyObj.token,
      channel.bodyObj.channelId
    );

    expect(channelDetailObj.bodyObj).toStrictEqual({
      name: 'ShenbaChannel',
      isPublic: false,
      ownerMembers: [
        {
          uId: test2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'Shenba',
          nameLast: 'Chen',
          handleStr: 'shenbachen',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: test2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'Shenba',
          nameLast: 'Chen',
          handleStr: 'shenbachen',
          profileImgUrl: expect.any(String),
        },
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Lee',
          handleStr: 'richardolee',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });
});

describe('Testing /channel/messages/v3', () => {
  test('Test-1: Error, invalid channelId', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    const channelMessageObj = requestChannelMessages(
      test1.bodyObj.token,
      channel.bodyObj.channelId + 1,
      0
    );
    expect(channelMessageObj.statusCode).toBe(BAD_REQUEST);
    expect(channelMessageObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, Invalid token', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    const channelMessageObj = requestChannelMessages(
      test1.bodyObj.token + '1',
      channel.bodyObj.channelId,
      0
    );
    expect(channelMessageObj.statusCode).toBe(FORBIDDEN);
    expect(channelMessageObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, channel is valid but authorised user is not in the channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    );
    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'LeeChannel',
      true
    );

    const channelMessageObj = requestChannelMessages(
      test2.bodyObj.token,
      channel.bodyObj.channelId,
      0
    );
    expect(channelMessageObj.statusCode).toBe(FORBIDDEN);
    expect(channelMessageObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Error, Start greater than total numebr of messages', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'LeeChannel',
      true
    );

    const channelMessageObj = requestChannelMessages(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      5
    );
    expect(channelMessageObj.statusCode).toBe(BAD_REQUEST);
    expect(channelMessageObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-5: Success, 0 message output', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'LeeChannel',
      true
    );

    const channelMessageObj = requestChannelMessages(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      0
    );
    expect(channelMessageObj.statusCode).toBe(OK);
    expect(channelMessageObj.bodyObj).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('Test-6: Success, start is 0, and there are in total 50 messages', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'LeeChannel',
      true
    );

    createMessages(test1.bodyObj.token, channel.bodyObj.channelId, 50);

    const channelMessageObj = requestChannelMessages(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      0
    );

    expect(channelMessageObj.statusCode).toBe(OK);
    expect(channelMessageObj.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });

    // Ensure the returned messages are from most recent to least recent
    expect(channelMessageObj.bodyObj.messages[0].message).toBe('49');
    expect(channelMessageObj.bodyObj.messages[49].message).toBe('0');
  });

  test('Test-7: Success, start is 60, and there are in total 60 messages', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'LeeChannel',
      true
    );

    createMessages(test1.bodyObj.token, channel.bodyObj.channelId, 60);

    const channelMessageObj = requestChannelMessages(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      60
    );

    expect(channelMessageObj.statusCode).toBe(OK);
    expect(channelMessageObj.bodyObj).toStrictEqual({
      messages: [],
      start: 60,
      end: -1,
    });
  });

  test('Test-8: Success, start is 0, and there are in total 51 messages', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'LeeChannel',
      true
    );

    createMessages(test1.bodyObj.token, channel.bodyObj.channelId, 51);

    const channelMessageObj1 = requestChannelMessages(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      0
    );

    const channelMessageObj2 = requestChannelMessages(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      50
    );

    expect(channelMessageObj1.statusCode).toBe(OK);
    expect(channelMessageObj2.statusCode).toBe(OK);
    expect(channelMessageObj1.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: 50,
    });
    expect(channelMessageObj2.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 50,
      end: -1,
    });

    // Ensure the returned messages are from most recent to least recent
    expect(channelMessageObj1.bodyObj.messages[0].message).toBe('50');
    expect(channelMessageObj1.bodyObj.messages[49].message).toBe('1');
    expect(channelMessageObj2.bodyObj.messages[0].message).toBe('0');
  });

  test('Test-9: Success, 3 channel message request to a channel with 124 messages', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'LeeChannel',
      true
    );

    createMessages(test1.bodyObj.token, channel.bodyObj.channelId, 124);

    const channelMessageObj1 = requestChannelMessages(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      0
    );

    const channelMessageObj2 = requestChannelMessages(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      50
    );

    const channelMessageObj3 = requestChannelMessages(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      100
    );

    // Three message request intervals adds up to 124
    expect(channelMessageObj1.statusCode).toBe(OK);
    expect(channelMessageObj2.statusCode).toBe(OK);
    expect(channelMessageObj3.statusCode).toBe(OK);
    expect(channelMessageObj1.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: 50,
    });
    expect(channelMessageObj2.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 50,
      end: 100,
    });
    expect(channelMessageObj3.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 100,
      end: -1,
    });

    // Ensure the returned messages are from most recent to least recent
    expect(channelMessageObj1.bodyObj.messages[16].message).toBe('107');
    expect(channelMessageObj2.bodyObj.messages[23].message).toBe('50');
  });

  test('Test-10: Successfully return 3 messages', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'LeeChannel',
      true
    );

    const messageId1 = requestMessageSend(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      'first'
    );

    const messageId2 = requestMessageSend(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      'second'
    );

    const messageId3 = requestMessageSend(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      'third'
    );

    const expectedTimeSent = Math.floor(Date.now() / 1000);

    const channelMessageObj1 = requestChannelMessages(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      0
    );
    expect(channelMessageObj1.statusCode).toBe(OK);

    // from the most recent to least recent
    expect(channelMessageObj1.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: messageId3.bodyObj.messageId,
          uId: test1.bodyObj.authUserId,
          message: 'third',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: messageId2.bodyObj.messageId,
          uId: test1.bodyObj.authUserId,
          message: 'second',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: messageId1.bodyObj.messageId,
          uId: test1.bodyObj.authUserId,
          message: 'first',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });

    // make sure the message sent has a time before now
    expect(
      channelMessageObj1.bodyObj.messages[0].timeSent
    ).toBeGreaterThanOrEqual(expectedTimeSent);
  });
});

describe('Testing /channel/leave/v2', () => {
  test('Test-1: Error, invalid channelId', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    const channelLeaveObj = requestChannelLeave(
      test1.bodyObj.token,
      channel.bodyObj.channelId + 1
    );
    expect(channelLeaveObj.statusCode).toBe(BAD_REQUEST);
    expect(channelLeaveObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, channelId is valid and the authorised user is not a member of the channel', () => {
    const ChannelMember = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const NotChannelMmember = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );

    const channel = requestChannelsCreate(
      ChannelMember.bodyObj.token,
      'RicardoChannel',
      true
    );

    const channelLeaveObj = requestChannelLeave(
      NotChannelMmember.bodyObj.token,
      channel.bodyObj.channelId
    );
    expect(channelLeaveObj.statusCode).toBe(FORBIDDEN);
    expect(channelLeaveObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, token is invalid', () => {
    const user = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const channel = requestChannelsCreate(
      user.bodyObj.token,
      'RicardoChannel',
      true
    );

    const channelLeaveObj = requestChannelLeave(
      user.bodyObj.token + '1',
      channel.bodyObj.channelId
    );
    expect(channelLeaveObj.statusCode).toBe(FORBIDDEN);
    expect(channelLeaveObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Error, User is the starter of an active standup in the channel', () => {
    const user = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const channel = requestChannelsCreate(
      user.bodyObj.token,
      'RicardoChannel',
      true
    );

    const timeFinish = Math.floor(Date.now() / 1000) + 1;
    requestStandupStart(
      user.bodyObj.token,
      channel.bodyObj.channelId,
      1
    );

    const channelLeaveObj = requestChannelLeave(
      user.bodyObj.token,
      channel.bodyObj.channelId
    );
    expect(channelLeaveObj.statusCode).toBe(BAD_REQUEST);
    expect(channelLeaveObj.bodyObj).toStrictEqual(undefined);
    sleep(2);
  });

  test('Test-4: Success case of leave channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channel.bodyObj.channelId);
    const messageSendObj = requestMessageSend(
      test2.bodyObj.token,
      channel.bodyObj.channelId,
      'Froot'
    );

    const channelLeaveObj = requestChannelLeave(
      test2.bodyObj.token,
      channel.bodyObj.channelId
    );
    expect(channelLeaveObj.statusCode).toBe(OK);
    expect(channelLeaveObj.bodyObj).toStrictEqual({});

    // Channel displayed without the user that left
    expect(
      requestChannelDetails(test1.bodyObj.token, channel.bodyObj.channelId)
        .bodyObj
    ).toStrictEqual({
      name: 'RicardoChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Lee',
          handleStr: 'richardolee',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Lee',
          handleStr: 'richardolee',
          profileImgUrl: expect.any(String),
        },
      ],
    });

    // message still remains after the user left
    const message = requestChannelMessages(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      0
    );
    expect(message.bodyObj.messages).toStrictEqual([
      {
        messageId: messageSendObj.bodyObj.messageId,
        uId: test2.bodyObj.authUserId,
        message: 'Froot',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
    ]);
  });

  test('Test-5: Success case of the owner leave channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelLeaveObj = requestChannelLeave(
      test1.bodyObj.token,
      channel.bodyObj.channelId
    );
    expect(channelLeaveObj.statusCode).toBe(OK);
    expect(channelLeaveObj.bodyObj).toStrictEqual({});

    // channel info displayed without the owner
    expect(
      requestChannelDetails(test2.bodyObj.token, channel.bodyObj.channelId)
        .bodyObj
    ).toStrictEqual({
      name: 'RicardoChannel',
      isPublic: true,
      ownerMembers: [],
      allMembers: [
        {
          uId: test2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'firstName',
          nameLast: 'lastName',
          handleStr: 'firstnamelastname',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });

  test('Test-6: Success case of the all members leaves the channel (check the channel list)', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelLeaveObj = requestChannelLeave(
      test1.bodyObj.token,
      channel.bodyObj.channelId
    );
    const channelLeaveObj2 = requestChannelLeave(
      test2.bodyObj.token,
      channel.bodyObj.channelId
    );
    expect(channelLeaveObj.statusCode).toBe(OK);
    expect(channelLeaveObj.bodyObj).toStrictEqual({});
    expect(channelLeaveObj2.statusCode).toBe(OK);
    expect(channelLeaveObj2.bodyObj).toStrictEqual({});

    // all user had left the channel
    expect(requestChannelsListAll(test1.bodyObj.token).bodyObj).toStrictEqual({
      channels: [
        {
          channelId: channel.bodyObj.channelId,
          name: 'RicardoChannel',
        },
      ],
    });
  });
});

describe('Testing /channel/addowner/v2', () => {
  test('Test-1: Error, invalid channelId', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelAddOwnerObj = requestChannelAddOwner(
      test1.bodyObj.token,
      channel.bodyObj.channelId + 1,
      test2.bodyObj.authUserId
    );
    expect(channelAddOwnerObj.statusCode).toBe(BAD_REQUEST);
    expect(channelAddOwnerObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, uId does not refer to a valid user', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    const channelAddOwnerObj = requestChannelAddOwner(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId + 1
    );
    expect(channelAddOwnerObj.statusCode).toBe(BAD_REQUEST);
    expect(channelAddOwnerObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, uId refers to a user who is not a member of the channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    const channelAddOwnerObj = requestChannelAddOwner(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelAddOwnerObj.statusCode).toBe(BAD_REQUEST);
    expect(channelAddOwnerObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Error, uId refers to a user who is already an owner of the channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    const channelAddOwnerObj = requestChannelAddOwner(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId
    );
    expect(channelAddOwnerObj.statusCode).toBe(BAD_REQUEST);
    expect(channelAddOwnerObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-5: Error, channelId is valid and the authorised user does not have owner permissions in the channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );

    requestChannelJoin(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelAddOwnerObj = requestChannelAddOwner(
      test2.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelAddOwnerObj.statusCode).toBe(FORBIDDEN);
    expect(channelAddOwnerObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-6: Error, token is invalid', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelAddOwnerObj = requestChannelAddOwner(
      test1.bodyObj.token + '1',
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelAddOwnerObj.statusCode).toBe(FORBIDDEN);
    expect(channelAddOwnerObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-7: Success, member been added as a owner', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelAddOwnerObj = requestChannelAddOwner(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelAddOwnerObj.statusCode).toBe(OK);
    expect(channelAddOwnerObj.bodyObj).toStrictEqual({});

    // displat channel info with two owners
    expect(
      requestChannelDetails(test1.bodyObj.token, channel.bodyObj.channelId)
        .bodyObj
    ).toStrictEqual({
      name: 'RicardoChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Lee',
          handleStr: 'richardolee',
          profileImgUrl: expect.any(String),
        },
        {
          uId: test2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'firstName',
          nameLast: 'lastName',
          handleStr: 'firstnamelastname',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Lee',
          handleStr: 'richardolee',
          profileImgUrl: expect.any(String),
        },
        {
          uId: test2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'firstName',
          nameLast: 'lastName',
          handleStr: 'firstnamelastname',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });

  test('Test-8: add multiple owners', () => {
    const owner = requestAuthRegister(
      'test0@gmail.com',
      '123456',
      'firstname0',
      'lastname0'
    );
    const member1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'firstname1',
      'lastname1'
    );
    const member2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstname2',
      'lastname2'
    );
    const member3 = requestAuthRegister(
      'test3@gmail.com',
      '123456',
      'firstname3',
      'lastname3'
    );
    const member4 = requestAuthRegister(
      'test4@gmail.com',
      '123456',
      'firstname4',
      'lastname4'
    );
    const member5 = requestAuthRegister(
      'test5@gmail.com',
      '123456',
      'firstname5',
      'lastname5'
    );
    const channel = requestChannelsCreate(
      owner.bodyObj.token,
      'channelName',
      true
    );

    requestChannelJoin(member1.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoin(member2.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoin(member3.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoin(member4.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoin(member5.bodyObj.token, channel.bodyObj.channelId);

    // add member1, member3, member5 to owner
    requestChannelAddOwner(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member1.bodyObj.authUserId
    );
    requestChannelAddOwner(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member3.bodyObj.authUserId
    );
    const multipleOwner = requestChannelAddOwner(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member5.bodyObj.authUserId
    );
    expect(multipleOwner.statusCode).toBe(OK);
    expect(multipleOwner.bodyObj).toStrictEqual({});

    // display channel info with multiple owners
    expect(
      requestChannelDetails(owner.bodyObj.token, channel.bodyObj.channelId)
        .bodyObj
    ).toStrictEqual({
      name: 'channelName',
      isPublic: true,
      ownerMembers: [
        {
          uId: owner.bodyObj.authUserId,
          email: 'test0@gmail.com',
          nameFirst: 'firstname0',
          nameLast: 'lastname0',
          handleStr: 'firstname0lastname0',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'firstname1',
          nameLast: 'lastname1',
          handleStr: 'firstname1lastname1',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member3.bodyObj.authUserId,
          email: 'test3@gmail.com',
          nameFirst: 'firstname3',
          nameLast: 'lastname3',
          handleStr: 'firstname3lastname3',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member5.bodyObj.authUserId,
          email: 'test5@gmail.com',
          nameFirst: 'firstname5',
          nameLast: 'lastname5',
          handleStr: 'firstname5lastname5',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: owner.bodyObj.authUserId,
          email: 'test0@gmail.com',
          nameFirst: 'firstname0',
          nameLast: 'lastname0',
          handleStr: 'firstname0lastname0',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'firstname1',
          nameLast: 'lastname1',
          handleStr: 'firstname1lastname1',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'firstname2',
          nameLast: 'lastname2',
          handleStr: 'firstname2lastname2',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member3.bodyObj.authUserId,
          email: 'test3@gmail.com',
          nameFirst: 'firstname3',
          nameLast: 'lastname3',
          handleStr: 'firstname3lastname3',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member4.bodyObj.authUserId,
          email: 'test4@gmail.com',
          nameFirst: 'firstname4',
          nameLast: 'lastname4',
          handleStr: 'firstname4lastname4',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member5.bodyObj.authUserId,
          email: 'test5@gmail.com',
          nameFirst: 'firstname5',
          nameLast: 'lastname5',
          handleStr: 'firstname5lastname5',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });
});

describe('Testing /channel/removeowner/v2', () => {
  test('Test-1: Error, invalid channelId', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    const channelRemoveOwnerObj = requestChannelRemoveOwner(
      test1.bodyObj.token,
      channel.bodyObj.channelId + 1,
      test1.bodyObj.authUserId
    );
    expect(channelRemoveOwnerObj.statusCode).toBe(BAD_REQUEST);
    expect(channelRemoveOwnerObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, uId does not refer to a valid user', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    const channelRemoveOwnerObj = requestChannelRemoveOwner(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId + 1
    );
    expect(channelRemoveOwnerObj.statusCode).toBe(BAD_REQUEST);
    expect(channelRemoveOwnerObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, uId refers to a user who is not an owner of the channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelRemoveOwnerObj = requestChannelRemoveOwner(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelRemoveOwnerObj.statusCode).toBe(BAD_REQUEST);
    expect(channelRemoveOwnerObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Error, uId refers to a user who is currently the only owner of the channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channel.bodyObj.channelId);

    // test1 is the only owner in the channel
    const channelRemoveOwnerObj = requestChannelRemoveOwner(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId
    );
    expect(channelRemoveOwnerObj.statusCode).toBe(BAD_REQUEST);
    expect(channelRemoveOwnerObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-5: Error, channelId is valid and the authorised user does not have owner permissions in the channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );

    const test3 = requestAuthRegister(
      'test3@gmail.com',
      '123456',
      'firstName3',
      'lastName3'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoin(test3.bodyObj.token, channel.bodyObj.channelId);
    requestChannelAddOwner(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );

    // test 3 does not have owner permission in the channel
    const channelRemoveOwnerObj = requestChannelRemoveOwner(
      test3.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelRemoveOwnerObj.statusCode).toBe(FORBIDDEN);
    expect(channelRemoveOwnerObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-6: Error, token is invalid', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelRemoveOwnerObj = requestChannelRemoveOwner(
      test1.bodyObj.token + 1,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelRemoveOwnerObj.statusCode).toBe(FORBIDDEN);
    expect(channelRemoveOwnerObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-7: Success case with removing a owner', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );

    const channel = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channel.bodyObj.channelId);

    requestChannelAddOwner(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );

    // remove the newly added owner
    const channelRemoveOwnerObj = requestChannelRemoveOwner(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelRemoveOwnerObj.statusCode).toBe(OK);
    expect(channelRemoveOwnerObj.bodyObj).toStrictEqual({});

    expect(
      requestChannelDetails(test1.bodyObj.token, channel.bodyObj.channelId)
        .bodyObj
    ).toStrictEqual({
      name: 'RicardoChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Lee',
          handleStr: 'richardolee',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Lee',
          handleStr: 'richardolee',
          profileImgUrl: expect.any(String),
        },
        {
          uId: test2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'firstName',
          nameLast: 'lastName',
          handleStr: 'firstnamelastname',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });

  test('Test-8: remove multiple owners', () => {
    const owner = requestAuthRegister(
      'test0@gmail.com',
      '123456',
      'firstname0',
      'lastname0'
    );
    const member1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'firstname1',
      'lastname1'
    );
    const member2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstname2',
      'lastname2'
    );
    const member3 = requestAuthRegister(
      'test3@gmail.com',
      '123456',
      'firstname3',
      'lastname3'
    );
    const member4 = requestAuthRegister(
      'test4@gmail.com',
      '123456',
      'firstname4',
      'lastname4'
    );
    const member5 = requestAuthRegister(
      'test5@gmail.com',
      '123456',
      'firstname5',
      'lastname5'
    );
    const channel = requestChannelsCreate(
      owner.bodyObj.token,
      'channelName',
      true
    );
    requestChannelJoin(member1.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoin(member2.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoin(member3.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoin(member4.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoin(member5.bodyObj.token, channel.bodyObj.channelId);
    // add all memmber to owner
    requestChannelAddOwner(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member1.bodyObj.authUserId
    );
    requestChannelAddOwner(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member2.bodyObj.authUserId
    );
    requestChannelAddOwner(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member3.bodyObj.authUserId
    );
    requestChannelAddOwner(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member4.bodyObj.authUserId
    );
    requestChannelAddOwner(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member5.bodyObj.authUserId
    );
    // remove member1, member3, member5 from owner
    requestChannelRemoveOwner(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member1.bodyObj.authUserId
    );
    requestChannelRemoveOwner(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member3.bodyObj.authUserId
    );
    const removeMultiple = requestChannelRemoveOwner(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member5.bodyObj.authUserId
    );
    expect(removeMultiple.statusCode).toBe(OK);
    expect(removeMultiple.bodyObj).toStrictEqual({});
    const channelDetail = requestChannelDetails(
      owner.bodyObj.token,
      channel.bodyObj.channelId
    );
    expect(channelDetail.bodyObj).toStrictEqual({
      name: 'channelName',
      isPublic: true,
      ownerMembers: [
        {
          uId: owner.bodyObj.authUserId,
          email: 'test0@gmail.com',
          nameFirst: 'firstname0',
          nameLast: 'lastname0',
          handleStr: 'firstname0lastname0',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'firstname2',
          nameLast: 'lastname2',
          handleStr: 'firstname2lastname2',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member4.bodyObj.authUserId,
          email: 'test4@gmail.com',
          nameFirst: 'firstname4',
          nameLast: 'lastname4',
          handleStr: 'firstname4lastname4',
          profileImgUrl: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: owner.bodyObj.authUserId,
          email: 'test0@gmail.com',
          nameFirst: 'firstname0',
          nameLast: 'lastname0',
          handleStr: 'firstname0lastname0',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'firstname1',
          nameLast: 'lastname1',
          handleStr: 'firstname1lastname1',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'firstname2',
          nameLast: 'lastname2',
          handleStr: 'firstname2lastname2',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member3.bodyObj.authUserId,
          email: 'test3@gmail.com',
          nameFirst: 'firstname3',
          nameLast: 'lastname3',
          handleStr: 'firstname3lastname3',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member4.bodyObj.authUserId,
          email: 'test4@gmail.com',
          nameFirst: 'firstname4',
          nameLast: 'lastname4',
          handleStr: 'firstname4lastname4',
          profileImgUrl: expect.any(String),
        },
        {
          uId: member5.bodyObj.authUserId,
          email: 'test5@gmail.com',
          nameFirst: 'firstname5',
          nameLast: 'lastname5',
          handleStr: 'firstname5lastname5',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });
});
