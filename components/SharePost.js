import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';

import {getRegisteredUsers, updateSharedPosts} from '../http.service';

import {SearchBar} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';

class SharePost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      registeredUsers: [],
      searchShareUser: '',
      disableShareButton: [],
    };
  }

  handleChange = (key, text) => {
    this.setState({[key]: text});
  };

  componentDidMount() {
    getRegisteredUsers()
      .then(res => {
        this.setState({registeredUsers: res.data});
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleShare = userId => {
    updateSharedPosts({
      id: userId,
      postId: this.props.navigation.getParam('postId'),
      sharedBy: this.props.navigation.getParam('name'),
      sharedById: this.props.navigation.getParam('usrId'),
    })
      .then(res => {
        getRegisteredUsers()
          .then(res => {
            this.setState({registeredUsers: res.data});
          })
          .catch(err => {
            console.log(err);
          });
        this.setState({
          disableShareButton: [...this.state.disableShareButton, userId],
        });

        // console.log('dsb', this.state.disableShareButton);
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
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
    let showShareUsers = this.state.registeredUsers.filter(x =>
      x.following.find(
        y => y.username === this.props.navigation.getParam('name'),
      ),
    );

    showShareUsers.sort(compare);

    if (this.state.searchShareUser.length > 0) {
      showShareUsers = showShareUsers.filter(user =>
        user.name
          .toLowerCase()
          .includes(this.state.searchShareUser.toLowerCase()),
      );
    }

    return (
      <View>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <SearchBar
            placeholder="Search users to share"
            onChangeText={text => {
              this.handleChange('searchShareUser', text);
            }}
            value={this.state.searchShareUser}
            containerStyle={{
              marginTop: 1,
              backgroundColor: 'rgb(255, 255, 255)',
              elevation: 10,

              borderBottomWidth: 3,
              height: 60,
              borderColor: 'skyblue',
            }}
            platform="android"
          />
        </View>
        {!showShareUsers.length && !this.state.searchShareUser ? (
          <ActivityIndicator
            size="large"
            style={{
              marginTop: 10,
            }}
          />
        ) : (
          <FlatList
            data={showShareUsers}
            renderItem={({item, index}) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  // justifyContent: 'space-between',
                  marginHorizontal: 10,
                }}>
                <View style={{flex: 0.5, marginVertical: 5}}>
                  <Image
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignSelf: 'center',
                      marginLeft: 0,
                    }}
                    resizeMode={'cover'}
                    source={
                      item.userPhoto
                        ? {
                            uri:
                              'http://192.168.0.108:3003/static/' +
                              item.userPhoto,
                          }
                        : require('../images/user.png')
                    }
                  />
                </View>
                <View
                  style={{
                    flex: 4,
                    //   marginVertical: 5,
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                      marginLeft: 20,
                      paddingVertical: 12,
                      borderBottomWidth: 0.2,
                      borderBottomColor: 'grey',
                    }}>
                    {item.name}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    borderBottomWidth: 0.2,
                    borderBottomColor: 'grey',
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.handleShare(item._id);
                    }}
                    style={{
                      height: 'auto',
                      width: 'auto',

                      // paddingVertical: 10,
                      //   backgroundColor: 'skyblue',
                      borderRadius: 10,
                      //   justifyContent: 'center',
                    }}
                    disabled={this.state.disableShareButton.find(
                      x => x === item._id,
                    )}>
                    <Text
                      style={{
                        fontSize: 16,
                        textAlign: 'center',
                        color: 'white',
                        padding: 5,
                      }}>
                      {this.state.disableShareButton.find(
                        x => x === item._id,
                      ) ? (
                        <Icon name="check" size={25} color="green" />
                      ) : (
                        <Icon name="share" size={25} color="black" />
                      )}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={item => item.index}
          />
        )}

        <View style={{flex: 1, marginTop: 40}}>
          <Text style={{textAlign: 'center', fontSize: 18}}>
            {this.state.searchShareUser.length > 0 &&
            showShareUsers.length == 0 ? (
              <Text>No matching users found</Text>
            ) : showShareUsers.length === 0 ? (
              <Text> Follow some users to share posts{' :) '}</Text>
            ) : (
              <> </>
            )}
          </Text>
        </View>
      </View>
    );
  }
}

export default SharePost;
