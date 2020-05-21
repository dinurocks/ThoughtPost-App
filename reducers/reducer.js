const myReducertkn = (state, action) => {
  if (!state) {
    return {
      jwt: '',
      id: '',
      username: '',
    };
  }

  switch (action.type) {
    case 'SAVE_TOKEN':
      console.log(action.data);
      return {
        ...state,
        jwt: action.data.token,

        id: action.data.userId,
        username: action.data.username,
      };

    case 'LOGOUT':
      return {
        ...state,
        jwt: '',
        id: '',
        username: '',
      };

    default:
      return state;
  }
};

export default myReducertkn;
