import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {addUser, getRegisteredUsers} from '../http.service';

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      nameError: '',
      emailError: '',
      mobileError: '',
      passwordError: '',
      confirmPasswordError: '',
      registeredUsers: [],
    };
  }

  componentDidMount() {
    getRegisteredUsers()
      .then(res => {
        this.setState({registeredUsers: res.data});
      })
      .catch(err => {
        console.log(err);
      });
  }

  validate = () => {
    let nameError = '';
    let emailError = '';
    let mobileError = '';
    let passwordError = '';
    let confirmPasswordError = '';
    let nmtch = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
    !this.state.name
      ? (nameError = 'Name cannot be blank!')
      : !nmtch.test(this.state.name)
      ? (nameError = 'No special characters!')
      : (nameError = '');

    let b = this.state.registeredUsers.map(x => x.email);
    let c = b.filter(z => z === this.state.email);

    let mobArr = this.state.registeredUsers.map(z => z.mobile);
    let finalMob = mobArr.filter(h => h === parseInt(this.state.mobile));

    let emreg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    !emreg.test(this.state.email)
      ? (emailError = 'Please enter a valid email')
      : c.length
      ? (emailError = 'Email already taken')
      : (emailError = '');

    let mobreg = /^[7-9][0-9]{9}$/;
    !mobreg.test(this.state.mobile)
      ? (mobileError = 'Invalid mobile number!')
      : finalMob.length
      ? (mobileError = 'Mobile already taken')
      : (mobileError = '');

    let pass = this.state.password;
    pass != this.state.confirmPassword
      ? (confirmPasswordError = "Password didn't match")
      : (confirmPasswordError = '');

    let passwrd = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d^a-zA-Z0-9].{5,50}$/;
    !passwrd.test(this.state.password)
      ? (passwordError = "Min chars '6', 1 UpperCase letter, 1 number ") //should contain 1 letter and 1 number
      : (passwordError = '');
    if (
      nameError ||
      emailError ||
      mobileError ||
      passwordError ||
      confirmPasswordError
    ) {
      this.setState({
        nameError,
        emailError,
        mobileError,
        passwordError,
        confirmPasswordError,
      });
      return false;
    }
    return true;
  };

  handleChange = (key, text) => {
    this.setState({[key]: text});
  };

  registerUser = () => {
    if (this.validate()) {
      addUser(this.state)
        .then(res => {
          getRegisteredUsers()
            .then(res => {
              this.setState({registeredUsers: res.data});
            })
            .catch(err => {
              console.log(err);
            });
          alert('User Registered Successfully');
          this.props.navigation.navigate('Login');
        })
        .catch(err => {
          if (err.response) {
            console.log(err.response.data);
          } else {
            console.log(err);
          }
        });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.registertoTP}>Register to ThoughtPost</Text>

        <View style={styles.phoneEmail}>
          <Text style={styles.text}>Name</Text>
          <TextInput
            placeholder="Name"
            style={styles.input}
            onChangeText={text => {
              this.handleChange('name', text);
            }}
          />
        </View>
        <Text style={styles.error}>{this.state.nameError}</Text>

        <View style={styles.phoneEmail}>
          <Text style={styles.text}>Email</Text>
          <TextInput
            caretHidden={true}
            autoCapitalize="none"
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            onChangeText={text => {
              this.handleChange('email', text);
            }}
          />
        </View>
        <Text style={styles.error}>{this.state.emailError}</Text>

        <View style={styles.phoneEmail}>
          <Text style={styles.text}>Mobile</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile"
            keyboardType="phone-pad"
            onChangeText={text => {
              this.handleChange('mobile', text);
            }}
          />
        </View>
        <Text style={styles.error}>{this.state.mobileError}</Text>

        <View style={styles.phoneEmail}>
          <Text style={styles.text}>Password</Text>
          <TextInput
            secureTextEntry={true}
            placeholder="Password"
            style={styles.input}
            onChangeText={text => {
              this.handleChange('password', text);
            }}
          />
        </View>
        <Text style={styles.error}>{this.state.passwordError}</Text>

        <View style={styles.phoneEmail}>
          <Text style={styles.text}> Confirm Password</Text>
          <TextInput
            secureTextEntry={true}
            placeholder="Confirm Password"
            style={styles.input}
            onChangeText={text => {
              this.handleChange('confirmPassword', text);
            }}
          />
        </View>
        <Text style={styles.error}>{this.state.confirmPasswordError}</Text>

        <TouchableOpacity onPress={this.registerUser} style={styles.button}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
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

  registertoTP: {
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
    overflow: 'scroll',
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
  buttonText: {
    fontSize: 20,
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
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 10,
    width: '30%',
  },
});

export default Register;
