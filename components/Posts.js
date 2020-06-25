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
  ScrollView,
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
import moment from 'moment';

import ShowMoreLikes from '../components/ShowMoreLikes';

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
      showMoreLikeName: [],
      showLikeModal: false,
    };
  }

  handleChange = (key, text) => {
    this.setState({[key]: text});
  };

  post = () => {
    let userImage = this.state.registeredUsers.filter(
      x => x._id === this.props.usrid,
    );

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
    fd.append('userPhoto', userImage[0].userPhoto);

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

  toggleOverlay = id => {
    // this.setState({onShare: !this.state.onShare, sharePostId: id});
    this.props.navigation.navigate('SharePost', {
      postId: id,
      name: this.state.compareName,
      usrId: this.props.usrid,
    });
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

  showLikedName = postId => {
    let likeName = this.state.showing.filter(x => x._id === postId);
    let ln = likeName.map(x => x.likes.map(y => y.username));
    ln = ln[0].slice(1);
    this.setState({
      showMoreLikeName: ln,
      // showLikeModal: !this.state.showLikedName,
    });
    // return <ShowMoreLikes demo={postId} />;
    this.props.navigation.navigate('ShowMoreLikes', {id: postId});
  };

  hideLikeModal = () => {
    this.setState({showLikeModal: false});
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
            userPhoto: sharedPost[0].userPhoto,
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
            backgroundColor: 'rgb(245, 245, 245)',
            elevation: 10,
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
                      elevation: 5,
                      backgroundColor: 'rgb(250, 250, 250)',
                      // boxShadow: '0px 0px 0px 150px #000',
                      marginBottom: 5,

                      // width: '97%',
                      marginHorizontal: 6,
                    }}>
                    <View
                    //  style={{borderBottomWidth: 0.2, borderColor: 'grey'}}
                    >
                      {item.sharedBy ? (
                        <View>
                          <Text style={{fontSize: 17}}>
                            (Shared By : {item.sharedBy})
                          </Text>
                          <View style={{flexDirection: 'row'}}>
                            <Image
                              style={{
                                height: 50,
                                width: 50,
                                marginTop: 10,
                              }}
                              borderRadius={25}
                              resizeMode="cover"
                              source={
                                item.userPhoto && item.userPhoto !== 'null'
                                  ? {
                                      uri:
                                        'http://192.168.0.108:3003/static/' +
                                        item.userPhoto,
                                    }
                                  : require('../images/user.png')
                              }
                            />
                            <Text
                              style={{
                                padding: 12,
                                fontSize: 17,
                                color: 'skyblue',
                                fontWeight: 'bold',
                              }}>
                              {item.user}
                            </Text>
                          </View>
                          <Text style={{marginLeft: 65, marginTop: -27}}>
                            ({moment(new Date(item.time)).fromNow()})
                          </Text>
                        </View>
                      ) : (
                        <View>
                          <View style={{flexDirection: 'row'}}>
                            <Image
                              style={{
                                height: 50,
                                width: 50,
                                marginTop: 10,
                              }}
                              borderRadius={25}
                              resizeMode="cover"
                              source={
                                item.userPhoto && item.userPhoto !== 'null'
                                  ? {
                                      uri:
                                        'http://192.168.0.108:3003/static/' +
                                        item.userPhoto,
                                    }
                                  : require('../images/user.png')
                              }
                            />
                            <Text
                              style={{
                                padding: 17,
                                fontSize: 17,
                                color: 'skyblue',
                                fontWeight: 'bold',
                              }}>
                              {item.user}
                            </Text>
                          </View>
                          <Text style={{marginLeft: 65, marginTop: -23}}>
                            ({moment(new Date(item.time)).fromNow()})
                          </Text>
                        </View>
                      )}
                      <View>
                        <Text style={item.post && {marginTop: 20}}>
                          {item.post && (
                            <Text style={{fontSize: 20}}>{item.post}</Text>
                          )}
                        </Text>
                      </View>
                    </View>

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
                            height: 390,
                            // marginTop: -8,
                            width: 390,
                            marginBottom: 5,
                            marginTop: 5,
                            // marginHorizontal: 0,

                            flex: 1,
                          }}
                          source={{
                            uri:
                              'http://192.168.0.108:3003/static/' +
                              item.postImage,
                          }}
                          resizeMode="contain"
                        />
                      )}
                    </View>

                    <View
                      style={{
                        flex: 1,
                        // flexDirection: 'row',
                        borderTopColor: 'grey',
                        borderTopWidth: 0.2,
                        // marginBottom: 5,
                        marginTop: 10,
                        // marginBottom: 5,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          paddingTop: 10,
                          paddingBottom: 5,
                        }}>
                        {item.likeCount > 0 && (
                          <Text style={{fontWeight: 'bold', paddingRight: 5}}>
                            Liked By:
                          </Text>
                        )}

                        {item.likes &&
                          item.likes.map(
                            (x, i) => i === 0 && <Text>{x.username}</Text>,
                          )}

                        <View>
                          <TouchableOpacity
                            onPress={() => {
                              this.showLikedName(item._id);
                            }}
                            // onPress={this.props.navigation.navigate('Likes')}
                          >
                            {item.likes && item.likeCount > 1 && (
                              <Text style={{fontWeight: 'bold'}}>
                                {' '}
                                and {item.likes.length - 1}{' '}
                                {item.likes.length - 1 === 1
                                  ? 'other'
                                  : 'others'}
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingTop: 10,
                        // borderTopWidth: 0.2,
                        // borderColor: 'rgba(0,0,0,0.2)',
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
    fontSize: 21,
    color: 'black',
    fontWeight: 'normal',
    // marginBottom: -20,

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
