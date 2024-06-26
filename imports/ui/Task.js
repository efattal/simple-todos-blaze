import { Template } from 'meteor/templating';

import { TasksCollection } from "../db/TasksCollection";

import './Task.html';

const df = new Intl.DateTimeFormat()

Template.date.helpers({
    creationDate(){
        return this ? ` (${df.format(this)})` : ""
    }
})

Template.task.events({
  'click .toggle-checked'() {
    Meteor.call('tasks.setIsChecked', this._id, !this.isChecked);
  },
  'click .delete'() {
    Meteor.call('tasks.remove', this._id);
  },
});