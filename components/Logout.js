import React, {Component} from 'react';
import {View, Alert} from 'react-native';
import {withNavigationFocus} from 'react-navigation';
import {removeToken} from '../http.service';
import {connect} from 'react-redux';
import {logoutAction} from '../actions/action';
class Logout extends Component {
  constructor(props) {
    super(props);

    if (this.props.isFocused) {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        {
          text: 'YES',
          onPress: () => {
            removeToken(this.props.usrid)
              .then(res => {
                this.props.dispatch(logoutAction());
                this.props.navigation.navigate('Login');
              })
              .catch(err => {
                console.log(err);
              });
          },
        },
        {text: 'NO', style: 'cancel'},
      ]);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isFocused && !prevProps.isFocused) {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        {
          text: 'YES',
          onPress: () => {
            removeToken(this.props.usrid)
              .then(res => {
                this.props.dispatch(logoutAction());
                this.props.navigation.navigate('Login');
              })
              .catch(err => {
                console.log(err);
              });
          },
        },
        {text: 'NO', style: 'cancel'},
      ]);
    }
  }

  render() {
    return <View />;
  }
}

const mapStateToProps = state => ({
  token: state.myReducertkn.jwt,
  usrid: state.myReducertkn.id,
});

export default withNavigationFocus(connect(mapStateToProps)(Logout));
