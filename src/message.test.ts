import {
  requestAuthRegisterV2,
  requestChannelJoinV2,
  requestChannelMessagesV2,
  requestChannelsCreateV2,
  requestClearV1,
  requestMessageSendV1,
  requestMessageEditV1,
  requestMessageRemoveV1,
  requestMessageSendDmV1,
  requestDmMessagesV1,
  requestDmCreateV1,
} from "./helperServer";

const OK = 200;
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestClearV1();
});

afterEach(() => {
  requestClearV1();
});

describe("Testing /message/send/v1", () => {
  test("Test-1: Error, channelId does not refer to a valid channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );
    const messageSendObj = requestMessageSendV1(
      test1.bodyObj.token,
      channelId.bodyObj.channelId + 1,
      "HelloWorld"
    );

    expect(messageSendObj.statusCode).toBe(OK);
    expect(messageSendObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-2: Error, length of message is less than 1 or over 1000 characters", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    // length of the message is less than 1
    const messageSendObj = requestMessageSendV1(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      ""
    );

    expect(messageSendObj.statusCode).toBe(OK);
    expect(messageSendObj.bodyObj).toStrictEqual(ERROR);

    // length of the message is more than 1000
    const messageSendObj1 = requestMessageSendV1(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      "HelloWorld".repeat(101)
    );

    expect(messageSendObj1.statusCode).toBe(OK);
    expect(messageSendObj1.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-3: Error, channelId is valid and the authorised user is not a member of the channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );
    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "firstChannel",
      true
    );

    const messageSendObj = requestMessageSendV1(
      test2.bodyObj.token,
      channelId.bodyObj.channelId,
      "firstMessage"
    );

    expect(messageSendObj.statusCode).toBe(OK);
    expect(messageSendObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-4: Error, token is invalid", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );

    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "firstChannel",
      true
    );

    const messageSendObj = requestMessageSendV1(
      test1.bodyObj.token + "1",
      channelId.bodyObj.channelId,
      "firstMessage"
    );

    expect(messageSendObj.statusCode).toBe(OK);
    expect(messageSendObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-5: Success, send 1 message", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );

    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "firstChannel",
      true
    );

    const messageSendObj = requestMessageSendV1(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      "firstMessage"
    );

    expect(messageSendObj.statusCode).toBe(OK);
    expect(messageSendObj.bodyObj).toStrictEqual({
      messageId: expect.any(Number),
    });

    expect(
      requestChannelMessagesV2(
        test1.bodyObj.token,
        channelId.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj.bodyObj.messageId,
          uId: test1.bodyObj.authUserId,
          message: "firstMessage",
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test("Test-6: Success, multiple message from multiple users", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );

    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "firstChannel",
      true
    );
    requestChannelJoinV2(test2.bodyObj.token, channelId.bodyObj.channelId);

    const messageSendObj1 = requestMessageSendV1(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      "firstMessage"
    );

    const messageSendObj2 = requestMessageSendV1(
      test2.bodyObj.token,
      channelId.bodyObj.channelId,
      "secondMessage"
    );

    const messageSendObj3 = requestMessageSendV1(
      test2.bodyObj.token,
      channelId.bodyObj.channelId,
      "thirdMessage"
    );

    expect(messageSendObj1.statusCode).toBe(OK);
    expect(messageSendObj2.statusCode).toBe(OK);
    expect(messageSendObj3.statusCode).toBe(OK);
    expect(messageSendObj1.bodyObj).toStrictEqual({
      messageId: expect.any(Number),
    });
    expect(messageSendObj2.bodyObj).toStrictEqual({
      messageId: expect.any(Number),
    });
    expect(messageSendObj3.bodyObj).toStrictEqual({
      messageId: expect.any(Number),
    });

    expect(
      requestChannelMessagesV2(
        test1.bodyObj.token,
        channelId.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj3.bodyObj.messageId,
          uId: test2.bodyObj.authUserId,
          message: "thirdMessage",
          timeSent: expect.any(Number),
        },
        {
          messageId: messageSendObj2.bodyObj.messageId,
          uId: test2.bodyObj.authUserId,
          message: "secondMessage",
          timeSent: expect.any(Number),
        },
        {
          messageId: messageSendObj1.bodyObj.messageId,
          uId: test1.bodyObj.authUserId,
          message: "firstMessage",
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

describe("Testing /message/edit/v1", () => {
  test("Test-1: Error, length of message is over 1000 characters", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );
    const messageSendObj1 = requestMessageSendV1(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      "firstMessage"
    );
    const messageEditObj = requestMessageEditV1(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      "HelloWorld".repeat(101)
    );

    expect(messageEditObj.statusCode).toBe(OK);
    expect(messageEditObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-2: Error, messageId does not refer to a valid message", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );
    const messageSendObj1 = requestMessageSendV1(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      "firstMessage"
    );
    const messageEditObj = requestMessageEditV1(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId + 1,
      "HelloWorld"
    );

    expect(messageEditObj.statusCode).toBe(OK);
    expect(messageEditObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-3: Error, messageId refer message in other channel (user not a member of)", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );
    const channelId1 = requestChannelsCreateV2(
      test1.bodyObj.token,
      "firstChannel",
      true
    );
    const channelId2 = requestChannelsCreateV2(
      test2.bodyObj.token,
      "secondChannel",
      true
    );
    const messageSendObj1 = requestMessageSendV1(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      "firstMessage"
    );
    const messageEditObj = requestMessageEditV1(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      "HelloWorld"
    );

    expect(messageEditObj.statusCode).toBe(OK);
    expect(messageEditObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-4: Error, messageId refer message in other dm (user not a member of)", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );
    const test3 = requestAuthRegisterV2(
      "test3@gmail.com",
      "password3",
      "firstName3",
      "lastName3"
    );
    const dmIdObj = requestDmCreateV1(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);
    const messageIdObj = requestMessageSendDmV1(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      "firstMessage"
    );

    const messageEditObj = requestMessageEditV1(
      test3.bodyObj.token,
      messageIdObj.bodyObj.messageId,
      "helloWorld"
    );
    expect(messageEditObj.bodyObj).toStrictEqual(ERROR);
    expect(messageEditObj.statusCode).toBe(OK);
  });

  test("Test-5: Error, the message was not sent by the user (channel), and user is not a owner", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );
    const channelId1 = requestChannelsCreateV2(
      test1.bodyObj.token,
      "firstChannel",
      true
    );

    const messageSendObj1 = requestMessageSendV1(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      "firstMessage"
    );
    const messageEditObj = requestMessageEditV1(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      "HelloWorld"
    );

    expect(messageEditObj.statusCode).toBe(OK);
    expect(messageEditObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-6: Error, the message was not sent by the user (dm), and user is not a owner", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );

    const dmIdObj = requestDmCreateV1(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageIdObj = requestMessageSendDmV1(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      "firstMessage"
    );

    const messageEditObj = requestMessageEditV1(
      test2.bodyObj.token,
      messageIdObj.bodyObj.messageId,
      "helloWorld"
    );
    expect(messageEditObj.bodyObj).toStrictEqual(ERROR);
    expect(messageEditObj.statusCode).toBe(OK);
  });

  test("Test-7: Error, token is invalid", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );

    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "firstChannel",
      true
    );
    const messageSendObj1 = requestMessageSendV1(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      "firstMessage"
    );
    const messageEditObj = requestMessageEditV1(
      test1.bodyObj.token + "1",
      messageSendObj1.bodyObj.messageId,
      "HelloWorld"
    );

    expect(messageEditObj.statusCode).toBe(OK);
    expect(messageEditObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-8: Success, edit message in a channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );
    const channelId1 = requestChannelsCreateV2(
      test1.bodyObj.token,
      "firstChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channelId1.bodyObj.channelId);

    const messageSendObj1 = requestMessageSendV1(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      "firstMessage"
    );
    const messageEditObj = requestMessageEditV1(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      "HelloWorld"
    );

    expect(messageEditObj.statusCode).toBe(OK);
    expect(messageEditObj.bodyObj).toStrictEqual({});

    expect(
      requestChannelMessagesV2(
        test1.bodyObj.token,
        channelId1.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj1.bodyObj.messageId,
          uId: test2.bodyObj.authUserId,
          message: "HelloWorld",
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test("Test-9: Success, owner edit other user's message in a channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );
    const channelId1 = requestChannelsCreateV2(
      test1.bodyObj.token,
      "firstChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channelId1.bodyObj.channelId);

    const messageSendObj1 = requestMessageSendV1(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      "firstMessage"
    );
    const messageEditObj = requestMessageEditV1(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      "HelloWorld"
    );

    expect(messageEditObj.statusCode).toBe(OK);
    expect(messageEditObj.bodyObj).toStrictEqual({});

    expect(
      requestChannelMessagesV2(
        test1.bodyObj.token,
        channelId1.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj1.bodyObj.messageId,
          uId: test2.bodyObj.authUserId,
          message: "HelloWorld",
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
  });
  // test("Test-10: Success, edit message in a dm", () => {
  //   const test1 = requestAuthRegisterV2(
  //     "test1@gmail.com",
  //     "password1",
  //     "firstName1",
  //     "lastName1"
  //   );
  //   const test2 = requestAuthRegisterV2(
  //     "test2@gmail.com",
  //     "password2",
  //     "firstName2",
  //     "lastName2"
  //   );

  //   const dmIdObj = requestDmCreateV1(test2.bodyObj.token, [
  //     test1.bodyObj.authUserId,
  //   ]);

  //   const messageSendObj1 = requestMessageSendDmV1(
  //     test1.bodyObj.token,
  //     dmIdObj.bodyObj.dmId,
  //     "firstMessage"
  //   );

  //   const messageEditObj = requestMessageEditV1(
  //     test1.bodyObj.token,
  //     messageSendObj1.bodyObj.messageId,
  //     "helloWorld"
  //   );
  //   expect(messageEditObj.bodyObj).toStrictEqual({});
  //   expect(messageEditObj.statusCode).toBe(OK);

  //   expect(
  //     requestDmMessagesV1(test1.bodyObj.token, dmIdObj.bodyObj.dmId, 0).bodyObj
  //   ).toStrictEqual({
  //     messages: [
  //       {
  //         messageId: messageSendObj1.bodyObj.messageId,
  //         uId: test1.bodyObj.authUserId,
  //         message: "HelloWorld",
  //         timeSent: expect.any(Number),
  //       },
  //     ],
  //     start: 0,
  //     end: -1,
  //   });
  // });

  // test("Test-11: Success, owner edit other user's message in a dm", () => {
  //   const test1 = requestAuthRegisterV2(
  //     "test1@gmail.com",
  //     "password1",
  //     "firstName1",
  //     "lastName1"
  //   );
  //   const test2 = requestAuthRegisterV2(
  //     "test2@gmail.com",
  //     "password2",
  //     "firstName2",
  //     "lastName2"
  //   );

  //   const dmIdObj = requestDmCreateV1(test2.bodyObj.token, [
  //     test1.bodyObj.authUserId,
  //   ]);

  //   const messageSendObj1 = requestMessageSendDmV1(
  //     test1.bodyObj.token,
  //     dmIdObj.bodyObj.dmId,
  //     "firstMessage"
  //   );

  //   const messageEditObj = requestMessageEditV1(
  //     test2.bodyObj.token,
  //     messageSendObj1.bodyObj.messageId,
  //     "helloWorld"
  //   );
  //   expect(messageEditObj.bodyObj).toStrictEqual({});
  //   expect(messageEditObj.statusCode).toBe(OK);

  //   expect(
  //     requestDmMessagesV1(test1.bodyObj.token, dmIdObj.bodyObj.dmId, 0).bodyObj
  //   ).toStrictEqual({
  //     messages: [
  //       {
  //         messageId: messageSendObj1.bodyObj.messageId,
  //         uId: test1.bodyObj.authUserId,
  //         message: "HelloWorld",
  //         timeSent: expect.any(Number),
  //       },
  //     ],
  //     start: 0,
  //     end: -1,
  //   });
  // });
});

describe("Testing /message/remove/v1", () => {
  test("Test-1: Error, messageId does not refer to a valid message", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );
    const messageSendObj1 = requestMessageSendV1(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      "firstMessage"
    );
    const messageRemoveObj = requestMessageRemoveV1(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId + 1
    );

    expect(messageRemoveObj.statusCode).toBe(OK);
    expect(messageRemoveObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-2: Error, messageId refer message in other channel (user not a member of)", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );
    const channelId1 = requestChannelsCreateV2(
      test1.bodyObj.token,
      "firstChannel",
      true
    );
    const channelId2 = requestChannelsCreateV2(
      test2.bodyObj.token,
      "secondChannel",
      true
    );
    const messageSendObj1 = requestMessageSendV1(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      "firstMessage"
    );
    const messageRemoveObj = requestMessageRemoveV1(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId
    );

    expect(messageRemoveObj.statusCode).toBe(OK);
    expect(messageRemoveObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-3: Error, messageId refer message in other dm (user not a member of)", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );
    const test3 = requestAuthRegisterV2(
      "test3@gmail.com",
      "password3",
      "firstName3",
      "lastName3"
    );
    const dmIdObj = requestDmCreateV1(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);
    const messageIdObj = requestMessageSendDmV1(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      "firstMessage"
    );

    const messageRemoveObj = requestMessageRemoveV1(
      test3.bodyObj.token,
      messageIdObj.bodyObj.messageId
    );
    expect(messageRemoveObj.bodyObj).toStrictEqual(ERROR);
    expect(messageRemoveObj.statusCode).toBe(OK);
  });

  test("Test-4: Error, the message was not sent by the user (channel), and user is not a owner", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );
    const channelId1 = requestChannelsCreateV2(
      test1.bodyObj.token,
      "firstChannel",
      true
    );

    const messageSendObj1 = requestMessageSendV1(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      "firstMessage"
    );
    const messageRemoveObj = requestMessageRemoveV1(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId
    );

    expect(messageRemoveObj.statusCode).toBe(OK);
    expect(messageRemoveObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-5: Error, the message was not sent by the user (dm), and user is not a owner", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );

    const dmIdObj = requestDmCreateV1(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageIdObj = requestMessageSendDmV1(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      "firstMessage"
    );

    const messageRemoveObj = requestMessageRemoveV1(
      test2.bodyObj.token,
      messageIdObj.bodyObj.messageId
    );
    expect(messageRemoveObj.bodyObj).toStrictEqual(ERROR);
    expect(messageRemoveObj.statusCode).toBe(OK);
  });

  test("Test-6: Error, token is invalid", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );

    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "firstChannel",
      true
    );
    const messageSendObj1 = requestMessageSendV1(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      "firstMessage"
    );
    const messageRemoveObj = requestMessageRemoveV1(
      test1.bodyObj.token + "1",
      messageSendObj1.bodyObj.messageId
    );

    expect(messageRemoveObj.statusCode).toBe(OK);
    expect(messageRemoveObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-7: Success, remove message in a channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );
    const channelId1 = requestChannelsCreateV2(
      test1.bodyObj.token,
      "firstChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channelId1.bodyObj.channelId);

    const messageSendObj1 = requestMessageSendV1(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      "firstMessage"
    );
    const messageRemoveObj = requestMessageRemoveV1(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId
    );

    expect(messageRemoveObj.statusCode).toBe(OK);
    expect(messageRemoveObj.bodyObj).toStrictEqual({});

    expect(
      requestChannelMessagesV2(
        test1.bodyObj.token,
        channelId1.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test("Test-8: Success, owner remove other user's message in a channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );
    const channelId1 = requestChannelsCreateV2(
      test1.bodyObj.token,
      "firstChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channelId1.bodyObj.channelId);

    const messageSendObj1 = requestMessageSendV1(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      "firstMessage"
    );
    const messageRemoveObj = requestMessageRemoveV1(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId
    );

    expect(messageRemoveObj.statusCode).toBe(OK);
    expect(messageRemoveObj.bodyObj).toStrictEqual({});

    expect(
      requestChannelMessagesV2(
        test1.bodyObj.token,
        channelId1.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
  // test("Test-9: Success, remove message in a dm", () => {
  //   const test1 = requestAuthRegisterV2(
  //     "test1@gmail.com",
  //     "password1",
  //     "firstName1",
  //     "lastName1"
  //   );
  //   const test2 = requestAuthRegisterV2(
  //     "test2@gmail.com",
  //     "password2",
  //     "firstName2",
  //     "lastName2"
  //   );

  //   const dmIdObj = requestDmCreateV1(test2.bodyObj.token, [
  //     test1.bodyObj.authUserId,
  //   ]);

  //   const messageSendObj1 = requestMessageSendDmV1(
  //     test1.bodyObj.token,
  //     dmIdObj.bodyObj.dmId,
  //     "firstMessage"
  //   );

  //   const messageRemoveObj = requestMessageRemoveV1(
  //     test1.bodyObj.token,
  //     messageSendObj1.bodyObj.messageId
  //   );
  //   expect(messageRemoveObj.bodyObj).toStrictEqual({});
  //   expect(messageRemoveObj.statusCode).toBe(OK);

  //   expect(
  //     requestDmMessagesV1(test1.bodyObj.token, dmIdObj.bodyObj.dmId, 0).bodyObj
  //   ).toStrictEqual({
  //     messages: [],
  //     start: 0,
  //     end: -1,
  //   });
  // });

  // test("Test-10: Success, owner remove other user's message in a dm", () => {
  //   const test1 = requestAuthRegisterV2(
  //     "test1@gmail.com",
  //     "password1",
  //     "firstName1",
  //     "lastName1"
  //   );
  //   const test2 = requestAuthRegisterV2(
  //     "test2@gmail.com",
  //     "password2",
  //     "firstName2",
  //     "lastName2"
  //   );

  //   const dmIdObj = requestDmCreateV1(test2.bodyObj.token, [
  //     test1.bodyObj.authUserId,
  //   ]);

  //   const messageSendObj1 = requestMessageSendDmV1(
  //     test1.bodyObj.token,
  //     dmIdObj.bodyObj.dmId,
  //     "firstMessage"
  //   );

  //   const messageRemoveObj = requestMessageRemoveV1(
  //     test2.bodyObj.token,
  //     messageSendObj1.bodyObj.messageId
  //   );
  //   expect(messageRemoveObj.bodyObj).toStrictEqual({});
  //   expect(messageRemoveObj.statusCode).toBe(OK);

  //   expect(
  //     requestDmMessagesV1(test1.bodyObj.token, dmIdObj.bodyObj.dmId, 0).bodyObj
  //   ).toStrictEqual({
  //     messages: [],
  //     start: 0,
  //     end: -1,
  //   });
  // });
});

describe("Testing /message/senddm/v1", () => {
  test("Test-1: Error, dmId does not refer to a valid DM", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );

    const dmIdObj = requestDmCreateV1(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageSendDmObj1 = requestMessageSendDmV1(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId + 1,
      "firstMessage"
    );

    expect(messageSendDmObj1.bodyObj).toStrictEqual(ERROR);
    expect(messageSendDmObj1.statusCode).toBe(OK);
  });

  test("Test-2: Error, length of message is less than 1 or over 1000 characters", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );

    const dmIdObj = requestDmCreateV1(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    // length of the message is less than 1
    const messageSendDmObj1 = requestMessageSendDmV1(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      ""
    );

    expect(messageSendDmObj1.bodyObj).toStrictEqual(ERROR);
    expect(messageSendDmObj1.statusCode).toBe(OK);

    // length of the message is more than 1000
    const messageSendDmObj2 = requestMessageSendDmV1(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      "HelloWorld".repeat(101)
    );

    expect(messageSendDmObj2.bodyObj).toStrictEqual(ERROR);
    expect(messageSendDmObj2.statusCode).toBe(OK);
  });

  test("Test-3: Error, channelId is valid and the authorised user is not a member of the channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );

    const test3 = requestAuthRegisterV2(
      "test3@gmail.com",
      "password3",
      "firstName3",
      "lastName3"
    );

    const dmIdObj = requestDmCreateV1(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageSendDmObj1 = requestMessageSendDmV1(
      test3.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      "helloWorld"
    );

    expect(messageSendDmObj1.bodyObj).toStrictEqual(ERROR);
    expect(messageSendDmObj1.statusCode).toBe(OK);
  });

  test("Test-4: Error, token is invalid", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "password1",
      "firstName1",
      "lastName1"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "password2",
      "firstName2",
      "lastName2"
    );

    const dmIdObj = requestDmCreateV1(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageSendDmObj1 = requestMessageSendDmV1(
      test1.bodyObj.token + 1,
      dmIdObj.bodyObj.dmId,
      "helloWorld"
    );

    expect(messageSendDmObj1.bodyObj).toStrictEqual(ERROR);
    expect(messageSendDmObj1.statusCode).toBe(OK);
  });

  // test("Test-5: Success, send 1 message", () => {
  //   const test1 = requestAuthRegisterV2(
  //     "test1@gmail.com",
  //     "password1",
  //     "firstName1",
  //     "lastName1"
  //   );
  //   const test2 = requestAuthRegisterV2(
  //     "test2@gmail.com",
  //     "password2",
  //     "firstName2",
  //     "lastName2"
  //   );

  //   const dmIdObj = requestDmCreateV1(test2.bodyObj.token, [
  //     test1.bodyObj.authUserId,
  //   ]);

  //   const messageSendDmObj1 = requestMessageSendDmV1(
  //     test1.bodyObj.token,
  //     dmIdObj.bodyObj.dmId,
  //     "helloWorld"
  //   );

  //   expect(messageSendDmObj1.statusCode).toBe(OK);
  //   expect(messageSendDmObj1.bodyObj).toStrictEqual({
  //     messageId: expect.any(Number),
  //   });

  //   expect(
  //     requestDmMessagesV1(test1.bodyObj.token, dmIdObj.bodyObj.channelId, 0)
  //       .bodyObj
  //   ).toStrictEqual({
  //     messages: [
  //       {
  //         messageId: messageSendDmObj1.bodyObj.messageId,
  //         uId: test1.bodyObj.authUserId,
  //         message: "helloWorld",
  //         timeSent: expect.any(Number),
  //       },
  //     ],
  //     start: 0,
  //     end: -1,
  //   });
  // });

  // test("Test-6: Success, multiple message from multiple users", () => {
  //   const test1 = requestAuthRegisterV2(
  //     "test1@gmail.com",
  //     "password1",
  //     "firstName1",
  //     "lastName1"
  //   );

  //   const test2 = requestAuthRegisterV2(
  //     "test2@gmail.com",
  //     "password2",
  //     "firstName2",
  //     "lastName2"
  //   );

  //   const dmIdObj = requestDmCreateV1(test2.bodyObj.token, [
  //     test1.bodyObj.authUserId,
  //   ]);

  //   const messageSendDmObj1 = requestMessageSendDmV1(
  //     test1.bodyObj.token,
  //     dmIdObj.bodyObj.dmId,
  //     "firstMessage"
  //   );
  //   const messageSendDmObj2 = requestMessageSendDmV1(
  //     test2.bodyObj.token,
  //     dmIdObj.bodyObj.dmId,
  //     "secondMessage"
  //   );
  //   const messageSendDmObj3 = requestMessageSendDmV1(
  //     test2.bodyObj.token,
  //     dmIdObj.bodyObj.dmId,
  //     "thirdMessage"
  //   );

  //   expect(messageSendDmObj1.statusCode).toBe(OK);
  //   expect(messageSendDmObj2.statusCode).toBe(OK);
  //   expect(messageSendDmObj3.statusCode).toBe(OK);
  //   expect(messageSendDmObj1.bodyObj).toStrictEqual({
  //     messageId: expect.any(Number),
  //   });
  //   expect(messageSendDmObj2.bodyObj).toStrictEqual({
  //     messageId: expect.any(Number),
  //   });
  //   expect(messageSendDmObj3.bodyObj).toStrictEqual({
  //     messageId: expect.any(Number),
  //   });

  //   expect(
  //     requestDmMessagesV1(test1.bodyObj.token, dmIdObj.bodyObj.channelId, 0)
  //       .bodyObj
  //   ).toStrictEqual({
  //     messages: [
  //       {
  //         messageId: messageSendDmObj1.bodyObj.messageId,
  //         uId: test1.bodyObj.authUserId,
  //         message: "firstMessage",
  //         timeSent: expect.any(Number),
  //       },
  //       {
  //         messageId: messageSendDmObj2.bodyObj.messageId,
  //         uId: test2.bodyObj.authUserId,
  //         message: "secondMessage",
  //         timeSent: expect.any(Number),
  //       },
  //       {
  //         messageId: messageSendDmObj3.bodyObj.messageId,
  //         uId: test2.bodyObj.authUserId,
  //         message: "thirdMessage",
  //         timeSent: expect.any(Number),
  //       },
  //     ],
  //     start: 0,
  //     end: -1,
  //   });
  // });
});
