import React, {PureComponent} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';

import {Card, SearchBar, ListItem, Overlay} from 'react-native-elements';
import {
  saveUserPost,
  showUserPost,
  delUser,
  updatePostLike,
  getRegisteredUsers,
  updateFollowUsers,
  updateSharedPosts,
  getPostImages,
} from '../http.service';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Ionicon from 'react-native-vector-icons/Ionicons';
import {withNavigationFocus} from 'react-navigation';
import ImagePicker from 'react-native-image-picker';

class Post extends PureComponent {
  constructor(props) {
    super(props);
    this.refreshFeed();
    this.state = {
      post: '',
      showing: [],
      showtkn: this.props.showtkn,
      usrid: this.props.usrid,
      searchFollowUser: '',
      username: this.props.username,
      registeredUsers: [],
      onShare: false,
      searchShareUser: '',
      sharePostId: '',
      disableShareButton: -1,
      shareButtonText: false,
      compareName: '',
      token: this.props.token,
      postImagesData: [],
      file: '',
      postLoading: false,
    };
  }

  handleChange = (key, text) => {
    this.setState({[key]: text});
  };

  post = () => {
    let fd = new FormData();
    let img = this.state.file;
    fd.append('id', this.props.usrid);
    fd.append('post', this.state.post);
    this.state.file &&
      fd.append('myImage', {
        name: img.fileName,
        type: img.type,
        uri:
          Platform.OS === 'android' ? img.uri : img.uri.replace('file://', ''),
        // img.uri,
      });

    this.setState({postLoading: true});

    console.log('newFD', fd);
    saveUserPost(fd)
      .then(res1 => {
        // alert('Posted');
        this.refreshFeed();
        this.setState({post: '', file: '', postLoading: false});
        // this.textInput.clear();
        getRegisteredUsers()
          .then(res => {
            this.setState({registeredUsers: res.data});
            let name1 = this.state.registeredUsers.filter(
              user => user._id === this.props.usrid,
            );
            let name2 = name1.map(x => x.name);
            this.setState({compareName: name2[0]});
            this.refreshFeed();
          })

          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        if (err.response) {
          console.log(err.response.data);
        } else console.log('Post error', err);
      });
    this.refreshFeed();
  };

  componentDidMount() {
    this.refreshFeed();
    getRegisteredUsers()
      .then(res => {
        this.setState({registeredUsers: res.data});
        let name1 = this.state.registeredUsers.filter(
          user => user._id === this.props.usrid,
        );
        let name2 = name1.map(x => x.name);
        this.setState({compareName: name2[0]});
      })

      .catch(err => {
        console.log(err);
      });

    // getPostImages().then(res => {
    //   this.setState({postImagesData: res.data});
    // });
  }

  refreshFeed = () => {
    showUserPost()
      .then(res => {
        this.setState({showing: res.data});
      })
      .catch(err => {
        if (err.response) {
          console.log(err.response.data);
        } else {
          console.log(err);
        }
      });
  };

  delPost = (id, index) => {
    Alert.alert('Delete', 'Are you sure you want to delete this post?', [
      {
        text: 'YES',
        onPress: () => {
          delUser(id)
            .then(() => {
              let {showing} = this.state;
              showing.splice(index, 1);
              this.setState({showing});
              this.refreshFeed();
            })
            .catch(err => {
              console.log(err);
            });
        },
      },
      {text: 'NO', style: 'cancel'},
    ]);
  };

  likePost = (postId, likeCount) => {
    updatePostLike({
      id: postId,
      userLikedName: this.state.username,
      likeCount: likeCount,
    })
      .then(res1 => {
        showUserPost()
          .then(res => {
            this.setState({showing: res.data});
          })
          .catch(err => {
            if (err.response) {
              console.log(err.response.data);
            } else {
              console.log(err);
            }
          });
      })
      .catch(err => {
        console.log('Couldnot update like status', err);
      });
  };

  addFollowing = registerId => {
    updateFollowUsers({
      id: registerId,
      followUserName: this.state.compareName,
      userId: this.props.usrid,
    })
      .then(res1 => {
        getRegisteredUsers()
          .then(res => {
            this.setState({registeredUsers: res.data});
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log('couldnot update user following');
      });
  };

  toggleOverlay = postId => {
    this.setState({onShare: !this.state.onShare, sharePostId: postId});
  };

  handleShare = userId => {
    this.setState({disableShareButton: userId, shareButtonText: true});
    updateSharedPosts({
      id: userId,
      postId: this.state.sharePostId,
      sharedBy: this.state.compareName,
      sharedById: this.props.usrid,
    })
      .then(res1 => {
        getRegisteredUsers()
          .then(res => {
            this.setState({registeredUsers: res.data});
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  };

  componentDidUpdate(prevProps) {
    if (this.props.isFocused && !prevProps.isFocused) {
      getRegisteredUsers()
        .then(res => {
          this.setState({registeredUsers: res.data});
          let name1 = this.state.registeredUsers.filter(
            user => user._id === this.props.usrid,
          );
          let name2 = name1.map(x => x.name);
          this.setState({compareName: name2[0]});
        })

        .catch(err => {
          console.log(err);
        });

      this.refreshFeed();
    }

    if (this.props.token && !prevProps.token) {
      this.props.navigation.navigate('Login');
    }
  }

  uploadImage = () => {
    const options = {
      noData: true,
    };
    ImagePicker.showImagePicker(options, response => {
      // console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
        this.setState({file: ''});
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        // const source = {uri: response.uri};

        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          file: response,
        });
        // console.log('imageselect', this.state.file);
      }
    });
  };

  render() {
    let showFollowUsers = [];
    if (this.state.searchFollowUser.length > 0) {
      showFollowUsers = this.state.registeredUsers.filter(
        user =>
          user.name
            .toLowerCase()
            .includes(this.state.searchFollowUser.toLowerCase()) &&
          user.name !== this.state.compareName,
      );
      showFollowUsers.sort(compare);
    }

    let showShareUsers = this.state.registeredUsers.filter(x =>
      x.following.find(y => y.username === this.state.compareName),
    );

    function compare(a, b) {
      const bandA = a.name.toUpperCase();
      const bandB = b.name.toUpperCase();
      let comparison = 0;
      if (bandA > bandB) {
        comparison = 1;
      } else if (bandA < bandB) {
        comparison = -1;
      }
      return comparison;
    }
    showShareUsers.sort(compare);

    if (this.state.searchShareUser.length > 0) {
      showShareUsers = showShareUsers.filter(user =>
        user.name
          .toLowerCase()
          .includes(this.state.searchShareUser.toLowerCase()),
      );
    }

    let postArray = [];
    const result = this.state.registeredUsers.filter(x =>
      x.following.find(y => y.username === this.state.compareName),
    );
    let namesArray = result.map(x => x.name);

    postArray = this.state.showing.filter(
      x => namesArray.includes(x.user) || x.user === this.state.compareName,
    );

    const currentLoggedInuser = this.state.registeredUsers.filter(
      x => x.name === this.state.compareName,
    );

    if (currentLoggedInuser.length > 0) {
      currentLoggedInuser[0].sharedPosts.map(x => {
        const sharedPost = this.state.showing.filter(y => y._id === x.postId);

        let modifiedSharedPost = {};
        if (sharedPost.length > 0) {
          modifiedSharedPost = {
            _id: sharedPost[0]._id,
            user: sharedPost[0].user,
            post: sharedPost[0].post,
            postImage: sharedPost[0].postImage,
            time: x.sharedTime,
            likeCount: sharedPost[0].likeCount,
            likes: sharedPost[0].likes,
            sharedBy: x.userName,
          };
        }

        postArray.push(modifiedSharedPost);
      });
    }

    postArray.sort((a, b) => {
      return new Date(b.time) - new Date(a.time);
    });
    // console.log('pa', postArray);

    return (
      <View style={{flex: 1, backgroundColor: 'rgba(245, 244, 242,0.2)'}}>
        <SearchBar
          placeholder="Search users to follow"
          onChangeText={text => {
            this.handleChange('searchFollowUser', text);
          }}
          value={this.state.searchFollowUser}
          containerStyle={{
            marginTop: 1,
            backgroundColor: 'rgb(242, 245, 245)',
            elevation: 30,
            borderRadius: 5,
            borderBottomWidth: 3,
            borderColor: 'skyblue',
          }}
          platform="android"
        />

        {/* follow users  start*/}

        <View>
          <FlatList
            style={{marginTop: 10}}
            data={showFollowUsers}
            renderItem={({item: userSearch}) => (
              <ListItem
                containerStyle={{
                  flex: 1,

                  marginBottom: 2,
                  elevation: 15,
                }}
                title={
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text style={{fontSize: 18}}>{userSearch.name} </Text>
                    {userSearch.following.find(
                      follow => follow.username === this.state.compareName,
                    ) ? (
                      <TouchableOpacity
                        style={styles.followUserButton}
                        onPress={() => {
                          this.addFollowing(userSearch._id);
                        }}>
                        <Icon name="user-check" color="green" size={25} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.followUserButton}
                        onPress={() => {
                          this.addFollowing(userSearch._id);
                        }}>
                        <Icon name="user-plus" color="black" size={25} />
                      </TouchableOpacity>
                    )}
                  </View>
                }
                bottomDivider
              />
            )}
            keyExtractor={userSearch => userSearch._id}
            extraData={showFollowUsers}
          />
          <View style={{flex: 1, marginTop: 0}}>
            <Text style={{textAlign: 'center', fontSize: 18}}>
              {this.state.searchFollowUser.length > 0 &&
              showFollowUsers.length == 0 ? (
                <Text>No matching users found</Text>
              ) : (
                <> </>
              )}
            </Text>
          </View>
        </View>

        {/* follow users end */}

        {/* showing posts start  */}
        {this.state.searchFollowUser.length === 0 && (
          <View style={{flex: 1}}>
            <View style={{marginTop: 10}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginHorizontal: 5,
                }}>
                <TextInput
                  style={styles.input}
                  selectTextOnFocus={true}
                  placeholder="What's on your mind..."
                  autoCapitalize="none"
                  onChangeText={text => {
                    this.handleChange('post', text);
                  }}
                  // ref={input => {
                  //   this.textInput = input;
                  // }}
                  value={this.state.post}
                />
                <TouchableOpacity
                  style={
                    this.state.file
                      ? [
                          styles.button,
                          {backgroundColor: 'green', marginRight: 10},
                        ]
                      : [
                          styles.button,
                          {marginRight: 10, backgroundColor: 'skyblue'},
                        ]
                  }
                  onPress={this.uploadImage}>
                  <Icon
                    name="image"
                    size={30}
                    color="white"
                    style={styles.text}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    this.state.file === '' && this.state.post.length === 0
                      ? [styles.button, {backgroundColor: 'lightgrey'}]
                      : styles.button
                  }
                  onPress={this.post}
                  disabled={
                    this.state.file === '' && this.state.post.length === 0
                  }>
                  <Ionicon
                    name="md-send"
                    size={30}
                    color="white"
                    style={styles.text}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {this.state.postLoading && (
              <ActivityIndicator
                animating={this.state.postLoading}
                size="large"
                style={{marginTop: 10}}
              />
            )}
            {postArray.length === 0 ? (
              <View>
                <Text
                  style={{textAlign: 'center', fontSize: 20, marginTop: 50}}>
                  Follow users to see their posts
                </Text>
              </View>
            ) : (
              <FlatList
                style={styles.flatlist}
                data={postArray}
                initialNumToRender={3}
                renderItem={({item, i}) => (
                  <Card
                    style={{flex: 1}}
                    containerStyle={{
                      flex: 1,
                      // elevation: 5,
                      backgroundColor: 'rgba(245, 245, 245,0.8)',
                      // boxShadow: '100px 100px 100px 150px #000',
                      marginBottom: 5,

                      width: '100%',
                      marginLeft: 0,
                    }}>
                    <Text
                      style={{
                        color: 'skyblue',
                        fontSize: 18,
                        fontWeight: 'bold',
                        borderBottomWidth: 0.2,
                        borderColor: 'rgba(0,0,0,0.2)',
                        // marginBottom: 0,
                      }}>
                      {item.sharedBy ? (
                        <Text>
                          <Text style={{color: 'grey'}}>
                            (Shared By : {item.sharedBy})
                          </Text>
                          {'\n'}

                          {item.user}
                        </Text>
                      ) : (
                        item.user
                      )}
                      {'\n\n'}
                      <Text
                        style={{
                          color: 'black',
                          fontWeight: 'normal',
                          // marginBottom: -50,
                        }}>
                        {item.post && (
                          <Text style={styles.postfrmt}>{item.post}</Text>
                        )}
                      </Text>
                      {'\n'}
                    </Text>

                    <View
                      style={{
                        // flex: 1,
                        alignItems: 'center',
                        // justifyContent: 'center',
                        // margin: 0,
                        // marginTop: -17,
                        // marginBottom: 5,
                      }}>
                      {item.postImage && (
                        <Image
                          style={{
                            height: 400,
                            // marginTop: -8,
                            width: 390,
                            // marginHorizontal: 0,

                            flex: 1,
                          }}
                          source={{
                            uri:
                              'http://192.168.0.108:3003/static/' +
                              item.postImage,
                          }}
                          resizeMode="center"
                        />
                      )}
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingTop: 10,
                        borderTopWidth: 0.2,
                        borderColor: 'rgba(0,0,0,0.2)',
                      }}>
                      <View style={{}}>
                        {item.likes &&
                        item.likes.find(
                          like => like.username === this.state.compareName,
                        ) ? (
                          <TouchableOpacity
                            style={{}}
                            onPress={() => {
                              this.likePost(item._id, item.likeCount);
                            }}>
                            <Text style={{fontSize: 25}}>
                              <Icon name="heart" size={25} color="red" solid />{' '}
                              : {item.likeCount}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={{}}
                            onPress={() => {
                              this.likePost(item._id, item.likeCount);
                            }}>
                            <Text style={{fontSize: 25}}>
                              <Icon name="heart" size={25} color="black" /> :{' '}
                              {item.likeCount}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      <View style={{}}>
                        <TouchableOpacity
                          onPress={() => {
                            this.toggleOverlay(item._id);
                          }}>
                          <Icon name="share" size={25} color="black" />
                        </TouchableOpacity>

                        <Overlay
                          isVisible={this.state.onShare === true}
                          onBackdropPress={() => {
                            this.toggleOverlay(item._id);
                          }}
                          fullScreen>
                          {/* actual overlay content starts */}
                          <View style={{flex: 1}}>
                            <View>
                              <SearchBar
                                placeholder="Search "
                                onChangeText={text => {
                                  this.handleChange('searchShareUser', text);
                                }}
                                value={this.state.searchShareUser}
                                containerStyle={{
                                  backgroundColor: 'rgb(242, 245, 245)',
                                  elevation: 30,
                                  borderRadius: 5,
                                  borderBottomWidth: 3,
                                  borderColor: 'skyblue',
                                }}
                                platform="android"
                              />
                            </View>
                            {/* share users list starts  */}
                            <FlatList
                              style={{marginTop: 10, flex: 1}}
                              data={showShareUsers}
                              renderItem={({item: itemed}) => (
                                <ListItem
                                  containerStyle={{
                                    flex: 1,

                                    marginBottom: 2,
                                    elevation: 15,
                                  }}
                                  title={
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                      }}>
                                      <Text style={{fontSize: 17}}>
                                        {itemed.name}
                                      </Text>
                                      <TouchableOpacity
                                        onPress={() => {
                                          this.handleShare(itemed._id);
                                        }}
                                        style={{
                                          backgroundColor: 'skyblue',
                                          width: 50,
                                          height: 40,
                                          justifyContent: 'center',
                                          borderRadius: 8,
                                          elevation: 5,
                                        }}
                                        disabled={
                                          this.state.disableShareButton ===
                                          itemed._id
                                        }>
                                        {this.state.shareButtonText &&
                                        this.state.disableShareButton ===
                                          itemed._id ? (
                                          <Text
                                            style={{
                                              color: 'black',
                                              textAlign: 'center',
                                            }}>
                                            Sent
                                          </Text>
                                        ) : (
                                          <Text
                                            style={{
                                              color: 'white',
                                              textAlign: 'center',
                                            }}>
                                            Share
                                          </Text>
                                        )}
                                      </TouchableOpacity>
                                    </View>
                                  }
                                  bottomDivider
                                />
                              )}
                              keyExtractor={itemed => itemed._id}
                              extraData={showShareUsers}
                            />

                            <View style={{flex: 1, marginTop: 40}}>
                              <Text style={{textAlign: 'center', fontSize: 18}}>
                                {this.state.searchShareUser.length > 0 &&
                                showShareUsers.length == 0 ? (
                                  <Text>No matching users found</Text>
                                ) : showShareUsers.length === 0 ? (
                                  <Text>
                                    {' '}
                                    Follow some users to share posts{' :) '}
                                  </Text>
                                ) : (
                                  <> </>
                                )}
                              </Text>
                            </View>

                            {/* share user list ends  */}
                          </View>
                          {/* overlay content ends  */}
                        </Overlay>
                      </View>

                      {/* sharepost ends  */}

                      <View style={{}}>
                        {this.state.compareName === item.user && (
                          <TouchableOpacity
                            style={{}}
                            onPress={() => {
                              this.delPost(item._id, i);
                            }}>
                            <Icon name="trash" size={25} color="tomato" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </Card>
                )}
                keyExtractor={(item, index) => item._id + index.toString()}
                extraData={postArray}
              />
            )}
          </View>
        )}
        {/* showing posts end  */}
      </View>
    );
  }
}

var styles = StyleSheet.create({
  text: {
    alignSelf: 'center',
  },
  followUsers: {
    borderColor: 'skyblue',
    borderBottomWidth: 2,

    marginHorizontal: 10,
    backgroundColor: 'transparent',
    width: '90%',
  },
  input: {
    height: 'auto',

    fontSize: 18,
    marginTop: 20,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    alignSelf: 'flex-start',
    width: '65%',
    elevation: 10,
    borderColor: 'rgb(242, 245, 245)',
    marginLeft: 0,
  },

  search: {
    borderColor: 'black',

    height: 50,
    marginHorizontal: 20,
    fontSize: 15,
    borderRadius: 5,
    marginLeft: 5,
    borderBottomWidth: 0.5,
  },

  button: {
    width: 50,

    backgroundColor: 'skyblue',
    borderRadius: 10,

    marginTop: 20,

    justifyContent: 'center',
    elevation: 10,
  },

  postfrmt: {
    fontSize: 20,
    // fontWeight: 'bold',
    // lineHeight: 40,
    // marginTop: 50,
    // marginVertical: 30,
    // paddingVertical: 30,
    // minHeight: 50,
    // borderBottomWidth: 0.2,
    // borderColor: 'rgba(0,0,0,0.2)',
  },

  flatlist: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    position: 'relative',

    backgroundColor: 'rgba(0,0,0,0.2)',

    marginTop: 30,
    marginBottom: 2,
  },
  overlayWidth: {
    width: '90%',
  },
  followUserButton: {
    elevation: 5,
    backgroundColor: 'white',
    width: 'auto',
    height: 'auto',
    padding: 10,
    borderRadius: 50,
  },
});

const mapStateToProps = state => ({
  data: state,
  token: state.myReducertkn.jwt,
  usrid: state.myReducertkn.id,
  username: state.myReducertkn.username,
});

export default withNavigationFocus(connect(mapStateToProps)(Post));
