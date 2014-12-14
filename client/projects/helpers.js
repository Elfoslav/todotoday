/** Project Form **/
Template.projectForm.helpers({
  tasks : function() {
    var projectId = Session.get('projectEditId');
    return Tasks.find({
      done : false,
      $or : [
        { project : null },
        { project : '' },
        { project : projectId }
      ]
    }, {
      sort: {
        name : 1
      }
    });
  },
  projectAction : function() {
    return Session.get('projectAction');
  }
});

Template.projectForm.rendered = function() {
  changePageTitle(Session.get('projectAction') + ' project');

  var projectEditId = Session.get('projectEditId');
  if(projectEditId) {
    var project = Projects.findOne(projectEditId);
    var tasks = Tasks.find({ project : project._id });
    $('#name').val(project.name);
    if(tasks) {
      tasks.forEach(function(task) {
        $('#' + task._id).prop('checked', true);
      });
    }
  }
};

/** Projects **/
Template.projects.helpers({
  projects : function() {
    return Projects.find({
      user : Meteor.userId()
    });
  }
});

Template.projects.rendered = function() {
  changePageTitle('Projects');
};

/** ProjectShow **/
Template.projectShow.helpers({
  project : function() {
    var project = Projects.findOne(Session.get('currentProjectId'));
    changePageTitle('Project: ' + project.name);
    return project;
  },
  projectTasks : function() {
    var tasks = Tasks.find({
        project : Session.get('currentProjectId'),
      },
      {
        sort : {
          done : 0
        }
      }
    );
    var out = '';
    var tasksCount = tasks.count();
    out += '<ol>'
    tasks.forEach(function(task) {
      out += '<li>';
      out += '<a href="/tasks/' + task._id + '">' + task.name + '</a>';
      if(task.done) {
        out += ' (done)';
      }
      out += '</li>';
    });
    out += '</ol>'
    return new Handlebars.SafeString(out);
  },
  taskTimes : function() {
    if(Session.get('projectTaskTimes'))
      return new Handlebars.SafeString(Session.get('projectTaskTimes'));
    return '';
  }
});

//this does not work properly - TODO improve
Template.projectShow.created = function() {
  //var projectTaskTimes = '';
  ////get all task times
  //Meteor.call('getTaskTimesByDate', null, null, null, function(err, taskTimes) {
  //  if(taskTimes) {
  //    taskTimes.each(function(taskTime) {
  //      var task = Tasks.findOne({
  //        project : Session.get('currentProjectId')
  //      });
  //    });
  //  }
  //  Session.set('projectTaskTimes', projectTaskTimes);
  //});
}

Template.projectShow.rendered = function() {

};
