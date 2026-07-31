export function register(userData) {
  if (!userData.name || !userData.email || !userData.password) {
    throw new Error("All fields are required.");
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const userExists = users.find(
    (user) => user.email === userData.email
  );

  if (userExists) {
    throw new Error("User already exists.");
  }

  users.push(userData);

  localStorage.setItem("users", JSON.stringify(users));

  return userData;
}

export function login(email, password) {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(
    (user) =>
      user.email === email &&
      user.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  localStorage.setItem(
    "currentUser",
    JSON.stringify(user)
  );

  return user;
}

export function logout() {
  localStorage.removeItem("currentUser");
}

export function getCurrentUser() {
  return JSON.parse(
    localStorage.getItem("currentUser")
  );
}

export function isAuthenticated() {
  return getCurrentUser() !== null;
}