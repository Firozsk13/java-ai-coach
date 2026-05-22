// Local Storage Utility

export const getVariable = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : '';
  } catch (error) {
    console.error(`Error getting localStorage item [${key}]:`, error);
    return '';
  }
};

export const setVariable = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage item [${key}]:`, error);
  }
};

export const removeVariable = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage item [${key}]:`, error);
  }
};

// Specific helper to remove logged-in user info
export const removeUser = () => {
  removeVariable('km_user_token');
};
