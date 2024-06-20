import { Template } from 'meteor/templating';
import { TasksCollection } from "../db/TasksCollection";
import { ReactiveDict } from 'meteor/reactive-dict';
import './App.html';
import './Task.js';
import "./Login.js";

const HIDE_COMPLETED_STRING = "hideCompleted";
const SORT_ALPHA_STRING = "sortALphabetically";
const IS_LOADING_STRING = "isLoading";
const TASK_EMPTY_STRING = "taskEmpty";

const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();
const isUserNotLogged = () => getUser() === null;

const getTasksFilter = () => {
  const user = getUser();

  const hideCompletedFilter = { isChecked: { $ne: true } };

  const userFilter = user ? { userId: user._id } : {};

  const pendingOnlyFilter = { ...hideCompletedFilter, ...userFilter };

  return { userFilter, pendingOnlyFilter };
}

Template.mainContainer.onCreated(function mainContainerOnCreated() {
  this.state = new ReactiveDict();

  const handler = Meteor.subscribe('tasks');

  Tracker.autorun(() => {
    this.state.set(IS_LOADING_STRING, !handler.ready());
  });

});

Template.mainContainer.helpers({
  isUserLogged,

  isUserNotLogged,

  getUser,

  isLoading() {
    const instance = Template.instance();
    return instance.state.get(IS_LOADING_STRING);
  },

  tasks() {
    const instance = Template.instance();
    const hideCompleted = instance.state.get(HIDE_COMPLETED_STRING);
    const sortALphabetically = instance.state.get(SORT_ALPHA_STRING);

    const { pendingOnlyFilter, userFilter } = getTasksFilter();

    if (!isUserLogged()) {
      return [];
    }

    return TasksCollection.find(hideCompleted ? pendingOnlyFilter : userFilter, {
      sort: sortALphabetically ? { text: 1 } : { createdAt: -1 },
    }).fetch();
  },

  hideCompleted() {
    return Template.instance().state.get(HIDE_COMPLETED_STRING);
  },
  
  sortAlphabetically() {
    return Template.instance().state.get(SORT_ALPHA_STRING);
  },

  isEmpty(){
    return TasksCollection.find().count() === 0
  },

  incompleteCount() {
    if (!isUserLogged()) {
      return '';
    }

    const { pendingOnlyFilter } = getTasksFilter();

    const incompleteTasksCount = TasksCollection.find(pendingOnlyFilter).count();
    return incompleteTasksCount ? `(${incompleteTasksCount})` : '';
  },
});

Template.mainContainer.events({
  "click #hide-completed-button"(e, instance) {
    const currentHideCompleted = instance.state.get(HIDE_COMPLETED_STRING);
    instance.state.set(HIDE_COMPLETED_STRING, !currentHideCompleted);
  },
  "click #sort-button"(e, instance) {
    instance.state.set(SORT_ALPHA_STRING, !instance.state.get(SORT_ALPHA_STRING));
  },
  'click #logout'() {
    Meteor.logout();
  }
});

Template.form.onCreated(function(){
  this.state = new ReactiveDict();
  this.state.set(TASK_EMPTY_STRING, true)
})

Template.form.helpers({
  isEmpty(){
    return Template.instance().state.get(TASK_EMPTY_STRING)
  }
})

Template.form.events({
  "keyup input"(e, instance){
    instance.state.set(TASK_EMPTY_STRING, e.target.value === "")
  },
  "submit .task-form"(e) {
    e.preventDefault();

    const {target} = e;

    Meteor.call('tasks.insert', target.text.value);

    // Clear form
    target.text.value = '';
  }
})