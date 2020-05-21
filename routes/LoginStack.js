import React, {Component} from 'react';
import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import Login from '../components/Login';
import Posts from '../components/Posts';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import Profile from '../components/Profile';
import Logout from '../components/Logout';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Register from '../components/Register';
import {Alert} from 'react-native';
import {removeToken} from '../http.service';
import {persistor} from '../index';
import {Persistor} from 'redux-persist';
import {logoutAction} from '../actions/action';

const screens = {
  Login: {
    screen: Login,
    navigationOptions: {
      headerShown: false,
    },
  },
  Register: {
    screen: Register,
    navigationOptions: {headerShown: false},
  },
};

const option = {
  initialRouteName: 'Login',
  defaultNavigationOptions: {
    headerTitleAlign: 'center',
    headerStyle: {backgroundColor: 'skyblue'},
    headerTitleStyle: {
      textAlign: 'center',
      fontWeight: 'bold',
      alignSelf: 'center',
    },
    headerTintColor: '#FFF',
  },
};

const TabNavigator = createBottomTabNavigator(
  {
    Posts: {
      screen: Posts,
    },
    Profile: {
      screen: Profile,
    },
    Logout: {
      screen: Logout,
    },
  },
  {
    defaultNavigationOptions: ({navigation}) => ({
      tabBarIcon: ({focused, horizontal, tintColor}) => {
        const {routeName} = navigation.state;

        let iconName;
        let iconColor;
        if (routeName === 'Posts') {
          iconName = 'list';
        } else if (routeName === 'Profile') {
          iconName = 'user-tie';
        } else if (routeName === 'Logout') {
          iconName = 'sign-out-alt';
        }
        iconColor = focused ? 'black' : 'white';
        return (
          <Icon
            name={iconName}
            size={25}
            color={iconColor}
            style={{elevation: 50}}
          />
        );
      },
      tabBarOnPress: ({navigation, defaultHandler}) => {
        const {state} = navigation;
        const userId = navigation.dangerouslyGetParent().getParam('id');

        if (state.routeName === 'Logout') {
        }

        defaultHandler();
      },
    }),
    tabBarOptions: {
      activeTintColor: 'black',
      inactiveTintColor: 'white',
      labelStyle: {
        fontSize: 12,
        fontWeight: 'bold',
      },
      showIcon: true,
      style: {
        backgroundColor: 'skyblue',
      },
    },
  },
);

const LoginStack = createStackNavigator(screens, option);

const RootStack = createSwitchNavigator(
  {
    UserLogin: LoginStack,
    TabNavigator: TabNavigator,
  },
  {
    navigationOptions: {
      headerMode: 'none',
    },
  },
);

export default createAppContainer(RootStack);
