import React, {Component} from 'react';
import logo from '../images/think.png';
import {Text, View, Image} from 'react-native';
import {connect} from 'react-redux';

class splashScreen extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'skyblue',
        }}>
        <Image
          style={{height: 80, width: 80, alignItems: 'center'}}
          source={logo}
        />
        <Text
          style={{
            textAlign: 'center',
            fontSize: 30,
            fontWeight: 'bold',
            color: 'black',
            marginLeft: 20,
            marginTop: 20,
          }}>
          ThoughtPost
        </Text>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  token: state.myReducertkn.jwt,
  usrid: state.myReducertkn.id,
});

export default connect(mapStateToProps)(splashScreen);
