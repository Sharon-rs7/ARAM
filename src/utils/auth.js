export const saveUser = (token, user) => {

  localStorage.setItem("token", token);

  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );

};

export const getToken = () => {

  return localStorage.getItem("token");

};

export const getUser = () => {

  return JSON.parse(
    localStorage.getItem("user")
  );

};

export const logout = () => {

  localStorage.removeItem("token");

  localStorage.removeItem("user");

};