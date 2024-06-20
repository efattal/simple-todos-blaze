import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import './Login.html';

const LOGIN_ERROR_STRING = "loginError"
const REGISTER_STRING = "register"

Template.login.onCreated(function mainContainerOnCreated() {
  this.state = new ReactiveDict();

  this.state.set(REGISTER_STRING, false)
})

Template.login.helpers({
  isRegistering() {
    const instance = Template.instance();
    return instance.state.get(REGISTER_STRING);
  },
  getError() {
    const instance = Template.instance();
    return instance.state.get(LOGIN_ERROR_STRING);
  }
})

Template.login.events({
  meteor: {
    configurationExists() {
      return ServiceConfiguration.configurations.findOne({ service: 'google' });
    },
  },
  'submit .login-form'(e, instance) {
    e.preventDefault();

    const target = e.target;

    const username = target.username.value;
    const password = target.password.value;

    if (instance.state.get(REGISTER_STRING)) {
      Accounts.createUser({
        username,
        password
      }, (error) => {
        instance.state.set(LOGIN_ERROR_STRING, error.reason);
      })
    }
    else {
      Meteor.loginWithPassword(username, password, (error) => {
        instance.state.set(LOGIN_ERROR_STRING, error.reason);
      });
    }
  },
  'click #register'(e, instance) {
    e.preventDefault();

    instance.state.set(REGISTER_STRING, true)

  },
  'click #cancel'(e, instance) {
    e.preventDefault();

    instance.state.set(REGISTER_STRING, false)
  },
  'click #loginGoogle'(e, instance) {
    e.preventDefault();

    Meteor.loginWithGoogle({
      requestPermissions: ['email'],
      loginStyle: 'popup',
    })
  }
});