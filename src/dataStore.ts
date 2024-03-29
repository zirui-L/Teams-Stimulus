export type Error = {
  error: string;
};
export type React = {
  reactId: number;
  uIds: Array<number>;
};
export type ReactReturn = {
  reactId: number;
  uIds: Array<number>;
  isThisUserReacted: boolean;
};
export type storedMessage = {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  isChannelMessage: boolean;
  dmOrChannelId: number;
  reacts: Array<React>;
  isPinned: boolean;
  taggedUsers: Array<number>;
  isSent: boolean;
};
export type Message = {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  reacts: Array<React>;
  isPinned: boolean;
};

type StandupMessages = {
  sender: string;
  message: string;
};

type Standup = {
  starter: number | null;
  isActive: boolean;
  finishingTime: number | null;
  messages: StandupMessages[];
};

export type Channel = {
  channelId: number;
  channelName: string;
  isPublic: boolean;
  ownerMembers: Array<number>;
  allMembers: Array<number>;
  messages: Array<number>;
  standUp: Standup;
};

type Notification = {
  channelId: number;
  dmId: number;
  notificationMessage: string;
};

export type storedUser = {
  authUserId: number;
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
  permissionId: number;
  channels: Array<number>;
  dms: Array<number>;
  profileImgUrl: string;
  messages: Array<number>;
  isRemoved: boolean;
  notifications: Notification[];
};

export type User = {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
  profileImgUrl: string;
};

export type Dm = {
  dmId: number;
  name: string;
  ownerMembers: number[];
  allMembers: number[];
  messages: number[];
};

export type Token = {
  token: string;
  uId: number;
};

export type ResetCode = {
  resetCode: string;
  authUserId: number;
  valid: boolean;
};

export type paginatedMessage = {
  messages: Array<Message>;
  start: number;
  end: number;
};

export type Data = {
  users: Array<storedUser>;
  channels: Array<Channel>;
  messages: Array<storedMessage>;
  dms: Array<Dm>;
  tokens: Array<Token>;
  reactIds: Array<number>;
  resetCodes: Array<ResetCode>;
  globalOwners: Array<number>;
};

// YOU SHOULD MODIFY THIS OBJECT BELOW
let data: Data = {
  users: [],
  channels: [],
  messages: [],
  dms: [],
  tokens: [],
  resetCodes: [],
  reactIds: [1],
  globalOwners: [],
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
function setData(newData: Data) {
  data = newData;
}

export { getData, setData };
