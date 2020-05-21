import axios from 'axios';

const baseURL = 'http://192.168.0.108:3003/';

export const addUser = data => {
  return axios.post(baseURL + 'postSomething', data);
};

export const checkUserMobPassword = data => {
  // return axios.put(baseURL + 'loginCheck', data);
  return axios.put('http://192.168.0.108:3003/loginCheck', data);
};

export const saveUserPost = data => {
  return axios.post(baseURL + 'feedPost', data);
};

export const showUserPost = () => {
  return axios.get(baseURL + 'getUserPosts');
};

export const delUser = id => {
  return axios.delete(baseURL + 'deleteUser', {data: {id}});
};

export const updatePostLike = data => {
  return axios.post(baseURL + 'updatePostLike', data);
};

export const getRegisteredUsers = () => {
  return axios.get(baseURL + 'getSomething');
};

export const updateFollowUsers = data => {
  return axios.post(baseURL + 'updateUserFollowing', data);
};

export const updateSharedPosts = data => {
  return axios.post(baseURL + 'updateSharedPosts', data);
};

export const removeToken = id => {
  return axios.get(baseURL + 'getUserId', {params: {id}});
};

export const profileInfo = id => {
  return axios.get(baseURL + 'profileInfo', {params: {id}});
};

export const updateProfileInfo = (id, name, email, mobile) => {
  return axios.get(baseURL + 'updateProfileInfo', {
    params: {id, name, email, mobile},
  });
};

export const updatePostUserName = (id, name) => {
  return axios.get(baseURL + 'updatePostUserName', {
    params: {id, name},
  });
};

export const updateUserFollowingName = (id, name) => {
  return axios.get(baseURL + 'updateUserFollowingName', {
    params: {id, name},
  });
};
