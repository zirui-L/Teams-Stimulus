import { getData, setData } from "./dataStore";

/**
 * <Create a new user with input email, password, first and last names. Create
 * unique authUserId and handle string for each user, and store all informations>
 *
 * @param none
 *
 * @returns {{}} - if the function successifully clear the data stored
 */

export const clearV1 = (): {} => {
  const data = getData();
  data.channels.length = 0;
  data.users.length = 0;
  setData(data);
  return {};
};