export const myActionTkn = (token, userId, username) => ({
  type: 'SAVE_TOKEN',
  data: {
    token,
    userId,
    username,
  },
});

export const logoutAction = () => ({
  type: 'LOGOUT',
  data: {},
});
