import React, {Component} from 'react';

import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import {
  profileInfo,
  getRegisteredUsers,
  updateProfileInfo,
  updatePostUserName,
  updateUserFollowingName,
  updateUserSharedName,
} from '../http.service';

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      email: '',
      mobile: '',
      editable: false,
      submitText: 'Edit',
      userInfo: [],
      registeredUsers: [],
      nameError: '',
      emailError: '',
      mobileError: '',
    };
  }

  showUserData = () =>
    profileInfo(this.props.usrid)
      .then(res => {
        this.setState({userInfo: res.data});
        this.setState({
          name: this.state.userInfo.name,
          email: this.state.userInfo.email,
          mobile: JSON.stringify(this.state.userInfo.mobile),
        });
      })
      .catch(err => {
        console.log(err);
      });

  handleChange = (key, text) => {
    this.setState({[key]: text});
  };

  validate = () => {
    let nameError = '';
    let emailError = '';
    let mobileError = '';
    let em = this.state.registeredUsers.filter(
      x => x.email !== this.state.userInfo.email,
    );
    let b = em.map(x => x.email);
    let c = b.filter(z => z === this.state.email);

    let mob = this.state.registeredUsers.filter(
      x => x.mobile !== parseInt(this.state.userInfo.mobile),
    );

    let mobArr = mob.map(z => z.mobile);
    let finalMob = mobArr.filter(h => h === parseInt(this.state.mobile));

    let nmtch = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
    !this.state.name
      ? (nameError = 'Name cannot be blank!')
      : !nmtch.test(this.state.name)
      ? (nameError = 'No special characters!')
      : (nameError = '');

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

    if (nameError || emailError || mobileError) {
      this.setState({nameError, emailError, mobileError});
      return false;
    }
    return true;
  };

  save = () => {
    if (this.state.submitText === 'Edit') {
      this.setState({editable: true, submitText: 'Save'});
    } else {
      if (this.validate()) {
        updateProfileInfo(
          this.props.usrid,
          this.state.name,
          this.state.email,
          this.state.mobile,
        ).then(res => {
          this.setState({
            editable: false,
            submitText: 'Edit',
            nameError: '',
            emailError: '',
            mobileError: '',
          });

          getRegisteredUsers()
            .then(res => {
              this.setState({registeredUsers: res.data});
            })
            .catch(err => {
              console.log(err);
            });
        });

        updatePostUserName(this.props.usrid, this.state.name).catch(err => {
          console.log(err);
        });

        updateUserFollowingName(this.props.usrid, this.state.name).catch(
          err => {
            console.log(err);
          },
        );

        updateUserSharedName(this.props.usrid, this.state.name).catch(err => {
          console.log(err);
        });
      }
    }
  };

  componentDidMount() {
    this.showUserData();
    getRegisteredUsers()
      .then(res => {
        this.setState({registeredUsers: res.data});
      })
      .catch(err => {
        console.log(err);
      });
  }

  cancel = () => {
    this.setState({
      editable: false,
      submitText: 'Edit',
      nameError: '',
      emailError: '',
      mobileError: '',
    });
    this.showUserData();
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>User Info</Text>
        <View style={styles.alignContent}>
          <Text style={styles.text}>Name</Text>
          <TextInput
            style={
              this.state.submitText === 'Edit'
                ? styles.input
                : [styles.input, {elevation: 2, backgroundColor: 'lightyellow'}]
            }
            placeholder="Name"
            onChangeText={text => {
              this.handleChange('name', text);
            }}
            value={this.state.name}
            editable={this.state.editable}
          />
        </View>
        <Text style={styles.errorText}>{this.state.nameError}</Text>

        <View style={styles.alignContent}>
          <Text style={styles.text}>Email</Text>
          <TextInput
            style={
              this.state.submitText === 'Edit'
                ? styles.input
                : [styles.input, {elevation: 2, backgroundColor: 'lightyellow'}]
            }
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={text => {
              this.handleChange('email', text);
            }}
            value={this.state.email}
            editable={this.state.editable}
          />
        </View>
        <Text style={styles.errorText}>{this.state.emailError}</Text>

        <View style={styles.alignContent}>
          <Text style={styles.text}>Mobile (+91) </Text>
          <TextInput
            style={
              this.state.submitText === 'Edit'
                ? styles.input
                : [styles.input, {elevation: 2, backgroundColor: 'lightyellow'}]
            }
            placeholder="Mobile"
            keyboardType="number-pad"
            onChangeText={text => {
              this.handleChange('mobile', text);
            }}
            value={this.state.mobile}
            editable={this.state.editable}
          />
        </View>
        <Text style={styles.errorText}>{this.state.mobileError}</Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <TouchableOpacity
            style={
              this.state.submitText === 'Edit'
                ? styles.button
                : [styles.button, {backgroundColor: 'green'}]
            }
            onPress={this.save}>
            <Text style={styles.buttonText}>{this.state.submitText}</Text>
          </TouchableOpacity>
          {this.state.editable && (
            <TouchableOpacity
              onPress={this.cancel}
              style={[styles.button, {backgroundColor: 'skyblue'}]}>
              <Text style={styles.buttonText}>Cancel </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  heading: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
    textShadowColor: 'rgb(242, 245, 245)',
    textShadowOffset: {width: 3, height: 1},
    textShadowRadius: 1,
  },
  alignContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: 'skyblue',
    elevation: 10,
    marginHorizontal: 10,
    width: '90%',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 10,
    width: '25%',
  },
  input: {
    width: '70%',
    fontSize: 18,
    color: 'grey',
    backgroundColor: '#FFFAFA',
    paddingRight: -20,
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
  errorText: {
    color: 'red',
    marginLeft: 10,
    fontSize: 17,
    marginTop: -10,
    marginBottom: 20,
  },
});

const mapStateToProps = state => ({
  data: state,
  usrid: state.myReducertkn.id,
  username: state.myReducertkn.username,
});

export default connect(mapStateToProps)(Profile);
