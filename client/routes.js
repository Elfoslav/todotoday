
NOT_FOUND = 'not_found';
LOGIN_PAGE = 'login';

Meteor.Router.add({
  '/': function() {
	return 'home';
  },

  '/tasks': function( ){
	if(Meteor.user() == null) {
	  return LOGIN_PAGE;
	}
	return 'tasks';
  },

  '/tasks/new': function() {
	if(Meteor.user() == null) {
	  return LOGIN_PAGE;
	}
	Session.set('taskAction', 'Add');
	return 'taskForm';
  },

  '/tasks/edit/:id': function(id) {
	if(Meteor.user() == null) {
	  return LOGIN_PAGE;
	}
	Session.set('taskEditId', id);
	Session.set('taskAction', 'Edit');
	return 'taskForm';
  },

  '/tasks/:id': function(id) {
	if(Meteor.user() == null) {
	  return LOGIN_PAGE;
	}

	task = Tasks.findOne(id);
	if(task && task.user == Meteor.userId()) {
	  // access parameters in order a function args too
	  Session.set('currentTaskId', id);
	  return 'showTask';
	} else {
	  return NOT_FOUND;
	}
  },

  '/projects': function( ){
	if(Meteor.user() == null) {
	  return LOGIN_PAGE;
	}
	return 'projects';
  },

  '/projects/new': function() {
	if(Meteor.user() == null) {
	  return LOGIN_PAGE;
	}
	Session.set('projectAction', 'Add');
	return 'projectForm';
  },

  '/projects/:id': function(id) {
	if(Meteor.user() == null) {
	  return LOGIN_PAGE;
	}

	var project = Projects.findOne(id);
	if(project && project.user == Meteor.userId()) {
	  // access parameters in order a function args too
	  Session.set('currentProjectId', id);
	  return 'projectShow';
	} else {
	  return NOT_FOUND;
	}
  },

  '/projects/edit/:id': function(id) {
	if(Meteor.user() == null) {
	  return LOGIN_PAGE;
	}
	Session.set('projectAction', 'Edit');
	Session.set('projectEditId', id);
	return 'projectForm';
  },

  '/history' : function() {
	if(Meteor.user() == null) {
	  return LOGIN_PAGE;
	}
	return 'history';
  },

  '/settings' : function() {
	if(Meteor.user() == null) {
	  return LOGIN_PAGE;
	}
	return 'settings';
  },

  '/about' : function() {
	return 'about';
  },

  '/todo' : function() {
	if(Meteor.user() == null) {
	  return LOGIN_PAGE;
	}
	return 'todo';
  },

  '/migrate' : function() {
	if(Meteor.user() == null) {
	  return LOGIN_PAGE;
	}
	return 'migrate';
  },

  '*': NOT_FOUND
});

Meteor.Router.beforeRouting = function() {
  Session.set('flashMessage', null);
  Session.set('taskEditId', null);
  Session.set('projectAction', null);
  Session.set('projectEditId', null);
  Session.set('currentTaskId', null);
  Session.set('currentProjectId', null);
  Session.set('dateFormatExample', null);
  Session.set('timeSpent', null);
  Session.set('projectTaskTimes', null);
};
