
NOT_FOUND = 'notFound';
LOGIN_PAGE = 'login';

Router.map(function() {
  this.route('home', { path: '/'},{ data: function() { console.log('home'); } });
  
  this.route('login');

  this.route('tasks', {
    data: function() {
      if(Meteor.user() == null) {
        this.redirect(LOGIN_PAGE);
      }
      return 'tasks';
    }
  });

  this.route('taskForm', {
    path: '/tasks/new',
    data: function() {
      Session.set('taskAction', 'Add');
      if(Meteor.user() == null) {
        this.redirect(LOGIN_PAGE);
      }
      return 'taskForm';
    }
  });

  this.route('showTask', {
    path: '/tasks/:id',
    data: function() {
      if(Meteor.user() == null) {
        this.redirect(LOGIN_PAGE);
      }
    
      var id = this.params.id;
      task = Tasks.findOne(id);
      if(task && task.user == Meteor.userId()) {
        // access parameters in order a function args too
        Session.set('currentTaskId', id);
        return 'showTask';
      } else {
        return NOT_FOUND;
      }
    }
  });

  this.route('taskForm', {
    path: '/tasks/edit/:id',
    data: function() {
      if(Meteor.user() == null) {
        this.redirect(LOGIN_PAGE);
      }
      var id = this.params.id;
      Session.set('taskEditId', id);
      Session.set('taskAction', 'Edit');
      return 'taskForm';
    }
  });
    
  this.route('projects', {
    data: function() {
      if(Meteor.user() == null) {
        this.redirect(LOGIN_PAGE);
      }
      return 'projects';
    }
  });

  this.route('projectForm', {
    path: '/projects/new',
    data: function() {
      if(Meteor.user() == null) {
        this.redirect(LOGIN_PAGE);
      }
      Session.set('projectAction', 'Add');
      return 'projectForm';
    }
  });

  this.route('projectShow', {
    path: '/projects/:id',
    data: function() {
      if(Meteor.user() == null) {
        this.redirect(LOGIN_PAGE);
      }
    
      var id = this.params.id;
      var project = Projects.findOne(id);
      if(project && project.user == Meteor.userId()) {
        // access parameters in order a function args too
        Session.set('currentProjectId', id);
        return 'projectShow';
      } else {
        return NOT_FOUND;
      }
    }
  });

  this.route('projectForm', {
    path: '/projects/edit/:id',
    data: function() {
      if(Meteor.user() == null) {
        this.redirect(LOGIN_PAGE);
      }
      var id = this.params.id;
      Session.set('projectAction', 'Edit');
      Session.set('projectEditId', id);
      return 'projectForm';
    }
  });
    
  this.route('history', {
    data: function() {
      if(Meteor.user() == null) {
        this.redirect(LOGIN_PAGE);
      }
      return 'history';
    }
  });

  this.route('settings', {
    data: function() {
      if(Meteor.user() == null) {
        this.redirect(LOGIN_PAGE);
      }
      return 'settings';
    }
  });

  this.route('about');

  this.route('todo', {
    data: function() {
      if(Meteor.user() == null) {
        this.redirect(LOGIN_PAGE);
      }
      return 'todo';
    }
  });

  this.route('migrate', {
    data: function() {
      if(Meteor.user() == null) {
        this.redirect(LOGIN_PAGE);
      }
      return 'migrate';
    }
  });
  
  this.route('notFound', {
    path: '*'
  });
});

Router.configure({
  layoutTemplate: 'layout',
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
});
