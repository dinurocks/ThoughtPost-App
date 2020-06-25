import React, {Component} from 'react';
import {View, Text, FlatList, ActivityIndicator, Image} from 'react-native';

import {showUserPost} from '../http.service';

class ShowMoreLikes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchPosts: [],
      showLikeNames: [],
    };
  }

  componentDidMount() {
    showUserPost()
      .then(res => {
        this.setState({fetchPosts: res.data});

        let likeName = this.state.fetchPosts.filter(
          x => x._id === this.props.navigation.getParam('id'),
        );
        // let ln = likeName.map(x => x.likes.map(y => y.username));
        let kk = likeName.map(x => x.likes.map(y => y));
        kk = kk[0].slice(1);
        // console.log('ss3', kk);
        // ln = ln[0].slice(1);
        this.setState({showLikeNames: kk});
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <View>
        {!this.state.showLikeNames.length ? (
          <ActivityIndicator
            size="large"
            style={{
              marginTop: 10,
            }}
          />
        ) : (
          <FlatList
            data={this.state.showLikeNames}
            renderItem={({item, index}) => (
              <View
                key={index}
                style={{
                  borderBottomWidth: 0.2,
                  borderBottomColor: 'grey',
                }}>
                <View style={{flexDirection: 'row'}}>
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
                  <Text
                    style={{
                      fontSize: 20,
                      marginLeft: 10,
                      paddingVertical: 10,
                    }}>
                    {item.username}
                  </Text>
                </View>
              </View>
            )}
            keyExtractor={item => item.index}
          />
        )}
      </View>
    );
  }
}

export default ShowMoreLikes;
