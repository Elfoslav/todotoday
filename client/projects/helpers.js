/** Project Form **/
Template.projectForm.helpers({
	tasks : function() {
		var projectId = Session.get('projectEditId');
		return Tasks.find({
			done : false,
			$or : [
				{ project : null },
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
	Meteor.call('changePageTitle', Session.get('projectAction') + ' project');

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
	Meteor.call('changePageTitle', 'Projects');
};

/** ProjectShow **/
Template.projectShow.helpers({
	project : function() {
		var project = Projects.findOne(Session.get('currentProjectId'));
		Meteor.call('changePageTitle', 'Project: ' + project.name);
		return project;
	},
	projectTasks : function() {
		var tasks = Tasks.find({
			project : Session.get('currentProjectId')
		});
		var out = '';
		var tasksCount = tasks.count();
		var counter = 0;
		tasks.forEach(function(task) {
			counter++;
			if(counter == tasksCount) {
				out += '<a href="/tasks/' + task._id + '">' + task.name + '</a>';
			} else {
				out += '<a href="/tasks/' + task._id + '">' + task.name + '</a>, ';
			}
		});
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
	var tasks = Tasks.find({
		project : Session.get('currentProjectId')
	});
	var projectTaskTimes = '';
	tasks.forEach(function(task) {
		Meteor.call('getTaskTimesByDate', null, null, task._id, function(err, taskTimes) {
			if(!Session.get('projectTaskTimes')) {
				projectTaskTimes += printTasksHistory(taskTimes);
			} else {
				projectTaskTimes += Session.get('projectTaskTimes') + printTasksHistory(taskTimes);
			}
			Session.set('projectTaskTimes', projectTaskTimes);
		});
	});
}

Template.projectShow.rendered = function() {

};
