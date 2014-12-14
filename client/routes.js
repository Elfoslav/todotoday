
NOT_FOUND = 'notFound';
LOGIN_PAGE = 'login';

var requiredLogin = function() {
  if (!Meteor.user()) {
    this.render(LOGIN_PAGE);
  } else {
    this.next();
  }
};

Router.onBeforeAction(requiredLogin, {
  //only: [ 'tasks', 'taskForm', 'showTask', 'projects', 'projectForm', 'history', 'settings', 'todo' ]
  except: [ 'home', 'about' ]
});

Router.route('/', function() {
  this.render('home');
}, {
  name: 'home'
});

Router.route('/login', function() {
  this.render('login');
});

Router.route('/tasks', {
  action: function() {
    this.render('tasks');
  }
});

Router.route('/tasks/new', function() {
  Session.set('taskAction', 'Add');
  this.render('taskForm');
});

Router.route('/tasks/:id', function() {
  var id = this.params.id;
  task = Tasks.findOne(id);
  if(task && task.user == Meteor.userId()) {
    // access parameters in order a function args too
    Session.set('currentTaskId', id);
    this.render('showTask');
  } else {
    this.render(NOT_FOUND);
  }
});

Router.route('/tasks/edit/:id', function() {
  var id = this.params.id;
  Session.set('taskEditId', id);
  Session.set('taskAction', 'Edit');
  this.render('taskForm');
});

Router.route('projects', function() {
  this.render('projects');
});

Router.route('/projects/new', {
  action: function() {
    Session.set('projectAction', 'Add');
    this.render('projectForm');
  }
});

Router.route('/projects/:id', function() {
  var id = this.params.id;
  var project = Projects.findOne(id);
  if(project && project.user == Meteor.userId()) {
    // access parameters in order a function args too
    Session.set('currentProjectId', id);
    this.render('projectShow');
  } else {
    this.render(NOT_FOUND);
  }
});

Router.route('/projects/edit/:id', function() {
  var id = this.params.id;
  Session.set('projectAction', 'Edit');
  Session.set('projectEditId', id);
  this.render('projectForm');
});

Router.route('/history', function() {
  this.render('history');
});

Router.route('/settings', function() {
  this.render('settings');
});

Router.route('/about', function() {
  this.render('about');
});

Router.route('/todo', function() {
  this.render('todo');
});

Router.route('notFound', {
  path: '*',
  action: function() {
    console.log('page not found');
  }
});

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: NOT_FOUND
});

Router.onRun(function() {
  Session.set('flashMessage', null);
  Session.set('taskEditId', null);
  Session.set('taskAction', null);
  Session.set('projectAction', null);
  Session.set('projectEditId', null);
  Session.set('currentTaskId', null);
  Session.set('currentProjectId', null);
  Session.set('dateFormatExample', null);
  Session.set('timeSpent', null);
  Session.set('projectTaskTimes', null);
  console.log('onRun before next');
  this.next();
  console.log('onRun after next');
});
