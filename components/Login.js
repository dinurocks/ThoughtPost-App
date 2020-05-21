import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {checkUserMobPassword} from '../http.service';
import {myActionTkn} from '../actions/action';
import {connect} from 'react-redux';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mobile: '',
      password: '',
      token: '',
      userId: '',
      username: '',
      passwordError: '',
      mobileError: '',
    };

    if (this.props.token !== '') {
      this.props.navigation.navigate('TabNavigator');
    }
  }

  validate = () => {
    let mobileError = '';
    let passwordError = '';

    let mobreg = /^[7-9][0-9]{9}$/;
    !mobreg.test(this.state.mobile)
      ? (mobileError = 'Invalid mobile number!')
      : (mobileError = '');

    let passwrd = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d^a-zA-Z0-9].{5,50}$/;
    !passwrd.test(this.state.password)
      ? (passwordError = "Min chars '6', 1 UpperCase letter, 1 number ") //should contain 1 letter and 1 number
      : (passwordError = '');
    if (mobileError || passwordError) {
      this.setState({mobileError, passwordError});
      return false;
    }
    return true;
  };

  login = () => {
    if (this.validate()) {
      checkUserMobPassword(this.state)
        .then(res => {
          this.setState({
            token: res.headers.auth,
            userId: res.data.userid,
            username: res.data.name,
          });

          this.props.save(
            this.state.token,
            this.state.userId,
            this.state.username,
          );
          alert('logged in');
          this.props.navigation.navigate('TabNavigator', {
            id: res.data.userid,
          });
        })
        .catch(err => {
          if (err.response) {
            console.log('response error', err.response.data);
            alert('mobile or password is incorrect');
          } else {
            console.log(err.message);
            alert('Failed to login');
          }
        });
    }
  };
  handleChange = (key, text) => {
    this.setState({[key]: text});
  };

  register = () => {
    this.props.navigation.navigate('Register');
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.alignImg}>
          <Image source={require('../images/think.png')} style={styles.img} />
        </View>

        <Text style={styles.loginText}>Log in to ThoughtPost</Text>

        <View style={styles.phoneEmail}>
          <Text style={styles.text}>Mobile (+91) </Text>
          <TextInput
            selectTextOnFocus={true}
            placeholder="Mobile"
            style={styles.input}
            keyboardType="phone-pad"
            onChangeText={text => {
              this.handleChange('mobile', text);
            }}
          />
        </View>
        <Text style={styles.error}>{this.state.mobileError}</Text>

        <View style={styles.phoneEmail}>
          <Text style={styles.text}>Password </Text>
          <TextInput
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize="none"
            style={styles.input}
            onChangeText={text => {
              this.handleChange('password', text);
            }}
          />
        </View>
        <Text style={styles.error}>{this.state.passwordError}</Text>

        <TouchableOpacity onPress={this.login} style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.account}>Don't have an account?</Text>
          <TouchableOpacity onPress={this.register}>
            <Text style={styles.buttonText1}> Register here</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  alignImg: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  img: {
    height: 80,
    width: 80,
  },
  loginText: {
    fontSize: 27,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
    textShadowColor: 'rgb(242, 245, 245)',
    textShadowOffset: {width: 3, height: 1},
    textShadowRadius: 1,
  },

  phoneEmail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: 'skyblue',
    elevation: 10,
    marginHorizontal: 10,
    width: '90%',
  },

  input: {
    width: '70%',
    fontSize: 18,
    backgroundColor: '#FFFAFA',
  },
  button: {
    backgroundColor: 'skyblue',
    width: 'auto',
    height: 'auto',
    borderRadius: 20,
    elevation: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 15,
  },

  buttonText1: {
    fontSize: 18,
    color: 'green',
  },

  account: {
    fontSize: 18,
  },
  buttonText: {
    fontSize: 22,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  error: {
    fontSize: 17,
    color: 'darkred',
    textAlign: 'left',
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
    elevation: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 10,
    width: '30%',
    textAlign: 'center',
  },
});

const mapStateToProps = state => ({
  token: state.myReducertkn.jwt,
  usrid: state.myReducertkn.id,
});

const mapDispatchToProps = dispatch => ({
  save: (token, userId, username) => {
    dispatch(myActionTkn(token, userId, username));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Login);
