
Template.taskForm.rendered = function() {

	group = getURLParameter('group');
	if(group) {
		$("#group").val(group);
	}

	if(Session.get('taskAction') == 'Edit') {
		var task = Tasks.findOne(Session.get('taskEditId'));
		fillInForm(task);
	}

	var projects = Projects.find();
	var taskProjectId = '';
	if(typeof task != 'undefined') {
		taskProjectId = task.project;
	}
	projects.forEach(function(project) {
		var values = {
			value : project._id,
			text : project.name
		};
		if(taskProjectId == project._id) {
			values.selected = true;
		}
		$('#project').append($('<option>', values));
	});

	initDatepicker('#due-date');
};

Template.tasks.rendered = function() {
	Meteor.call('changePageTitle', 'Tasks');
}

/**
 * Fill in form with data
 * @param JSON data
 */
var fillInForm = function(data) {
	if(data) {
		$.each(data, function(name, val){
			var $el = $('[name="'+name+'"]'),
				type = $el.attr('type');

			switch(type){
				case 'checkbox':
					if(val)
						$el.attr('checked', 'checked');
					break;
				case 'radio':
					$el.filter('[value="'+val+'"]').attr('checked', 'checked');
					break;
				default:
					$el.val(val);
			}
			if($el.attr('id') == 'due-date') {
				if(val) {
					$el.val(moment(val).format(Session.get('dateFormat')));
				}
			}
		});
	}
}

Template.taskForm.helpers({
	taskAction : function () {
		taskAction = Session.get('taskAction');
		Meteor.call('changePageTitle', taskAction + " task");
		return taskAction;
	},
	userId : function() {
		return Meteor.userId();
	}
});

Template.showTask.helpers({
	task : function() {
		var id = Session.get('currentTaskId');
		var task = Tasks.findOne(id);
		Meteor.call('changePageTitle', "Task: " + task.name);
		return task;
	},
	projectLink : function(id) {
		var project = Projects.findOne(id);
		var out = '<a href="/projects/' + id + '">' + project.name + '</a>';
		return new Handlebars.SafeString(out);
	},
	moment : function(dateTime) {

		if(dateTime) {
			var date = moment(dateTime);

			return date.format('dddd ' + Session.get('dateFormat'));
		}
		return '';
	},
	timeSpent : function(taskId) {
		if(!taskId) {
			throw new Meteor.Error(500, 'taskId is required');
		}
		task = Tasks.findOne(taskId);
		if(!task) {
			throw new Meteor.Error(404, 'Task not found');
		}
		totalTime = 0;

		if(task.doing) {
			totalTime = (Session.get('timeSpent')) ? Session.get('timeSpent') : totalTime;
		}
		return makeTime(totalTime);
	},
	doingFrom : function(taskId) {
		var currUserTask = CurrentUserTask.findOne({ task : taskId });
		if(currUserTask) {
			return moment(currUserTask.start).format(getMomentDateTimeFormat());
		}
		return '';
	},
	taskTimes : function(taskId) {
		task = Tasks.findOne(taskId);
		if(!task) {
			throw new Meteor.Error(404, 'Task not found');
		}
		var out = printTaskTimes(task, 'taskView');
		if(out == '') {
			out = 'You haven\'t worked on this task yet.';
		}
		return new Handlebars.SafeString(out);
	},
	showDescription : function(description) {
		return new Handlebars.SafeString(description.replace(/\n/g, "<br />"));
	},
	dateTimeFormat : function() {
		return getTimePickerDateTimeFormat(Session.get('dateFormat'), Session.get('timeFormat'));
	}
});

Template.showTask.rendered = function() {
	$('#start-time, #end-time, #datetimepicker1').datetimepicker();
};

/**
 * @param selector
 */
function initDatepicker(selector) {
	if(!selector) {
		selector = '.date';
	}
	$(selector).datepicker().on('changeDate', function(e) {
		$(this).datepicker('hide');
	});
}

Template.tasks.helpers({
	tasks : function() {
		var tasks = Tasks.find({
			user : Meteor.userId(),
			group : 'all',
			done : false
		}, {
			sort : { doing : -1, name : 1 }
		});
		return tasks;
	},
	todayTasks : function() {
		var tasks = Tasks.find({
			user : Meteor.userId(),
			group : 'today',
			done : false
		}, {
			sort : { doing : -1, name : 1 }
		});
		return tasks;
	},
	doneTasks : function() {
		return Tasks.find({
			user : Meteor.userId(),
			done : true
		}, {
			$sort : { name : 1 }
		});
	},
	userAllTasksCount : function() {
		return Tasks.find({
			user : Meteor.userId(),
			group: 'all',
			done : false
		}).count();
	},
	userTodayTasksCount : function() {
		return Tasks.find({
			user : Meteor.userId(),
			group: 'today',
			done : false
		}).count();
	},
	/**
	 * Task list helper - show tasks in table
	 */
	taskList : function(tasks) {
		var out = '<table class="table">';
		tasks.forEach(function(task) {
			if(task.done) {
				//task is done
				iconDoneUndone = '<a href="#undone" data-action="undone" data-id="'+ task._id + '"><i class="icon-repeat action" title="Mark task as NOT done"></i></a>';
			} else {
				iconDoneUndone = '<a href="#done" data-action="done" data-id="'+ task._id + '"><i class="icon-ok action" title="Mark task as done"></i></a>';
			}
			if(task.group == 'all') {
				iconMove = '<a href="#move-today" data-action="move" data-id="'+ task._id + '" data-group="today" title="Move to today"><i class="icon-arrow-right"></i></a>';
			} else {
				iconMove = '<a href="#move-all" data-action="move" data-id="'+ task._id + '" data-group="all" title="Move to all"><i class="icon-arrow-left"></i></a>';
			}
			if(task.done) {
				iconMove = '';
			}
			var doing = task.doing ? '(doing)' : '';
			var doingClass = task.doing ? 'info' : '';
			out += '<tr id="'+ task._id + '" class="task-row ' + doingClass + '">';
			out += '<th title="' + task.description + '"><a href="/tasks/' + task._id + '">' + task.name + '</a> ' + doing + '</th>';
			out += '<td>\
						' + iconMove + '	\
					</td>\
					<td> \
						' + iconDoneUndone + ' \
					</td> \
					<td> \
						<a href="/tasks/edit/'+ task._id + '"><i class="icon-pencil" title="Edit task"></i></a> \
					</td> \
					<td> \
						<a href="#delete" data-action="delete" data-id="'+ task._id + '"><i class="icon-remove" title="Delete task"></i></a> \
					</td>';

			out += '</tr>';
		});
		out += '</table>';

		return new Handlebars.SafeString(out);
	}
});
