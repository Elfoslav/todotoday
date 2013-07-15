var deleteTaskEvent = {
	'click [data-event]' : function(e) {
		e.preventDefault();
		console.log('data event: '+$(this).data('event'));
	}
};

Template.taskForm.events({
	'click #submit' : function(e) {
		e.preventDefault();

		if($('#name').val()) {
			name = $('#name').val();
			description = $('#description').val();
			//JSON data
			data = $('#frm-task').serializeObject();
			//if checkbox done is not checked, set default done = false
			if(!data.done) {
				data.done = false;
			} else {
				data.done = true;
			}
			if(data.dueDate) {
				data.dueDate = moment(data.dueDate, Session.get('dateFormat')).toDate();
			}

			if(Session.get('taskAction') == 'Add') {
				Meteor.call('insertTask', data, function(err, taskId) {
					Meteor.Router.to('/tasks/'+taskId);
				});
			}
			if(Session.get('taskAction') == 'Edit') {
				var taskId = Session.get('taskEditId');
				Meteor.call('updateTask', taskId, data);
				redirectTask();
				Session.set('flashMessage', 'Task saved');
			}
		} else {
			$('#name').focus();
		}
	},
	'click #cancel' : function(e) {
		e.preventDefault();

		redirectTask();
	}
});

Template.tasks.events({
	'click [data-action]' : function(e) {
		e.preventDefault();

		processTaskAction(e);
	}
});

Template.showTask.events({
	'click [data-action]' : function(e) {
		e.preventDefault();

		processTaskAction(e);
	}
});

function redirectTask() {
	var id = getURLParameter('id');
	console.log('id: ', id, new Date());
	if(id) {
		//back to task
		Meteor.Router.to('/tasks/'+id);
	}
	else {
		Meteor.Router.to('/tasks');
	}
}

/**
 *@param event
 */
function processTaskAction(e) {
	elem = e.currentTarget;
	data = elem.dataset;

	switch(data.action) {
		case 'delete' :
			if(confirm('Do you want to delete this task?')) {
				Meteor.call('deleteTask', data.id);
				Session.set('flashMessage', 'Task removed');
				if(Session.get('currentTaskId'))
					Meteor.Router.to('/tasks');
			}
			break;
		case 'done' :
			Meteor.call('doneTask', data.id);
			if(!Session.get('currentTaskId')) {
				Session.set('flashMessage', 'Task has been marked as done');
			}
			break;
		case 'undone' :
			Meteor.call('undoneTask', data.id);
			if(!Session.get('currentTaskId')) {
				Session.set('flashMessage', 'Task has been marked as undone');
			}
			break;
		case 'move' :
			var group = data.group;
			Meteor.call('moveTask', data.id, group, function(err, data) {
				if(!err) {
					Session.set('flashMessage', 'Task moved to "' + group + '"');
				}
			});
			break;
		case 'startdoing' :
			var taskId = data.id;
			Meteor.call('startDoing', taskId, function(err, data) {
				if(!err) {
					console.log('doingIterval: ', app.doingInterval);
					if(!app.doingInterval) {
						app.doingInterval = startTimeSpentInterval(taskId);
					}
				}
			});
			break;
		case 'stopdoing' :
			Meteor.call('stopDoing', data.id, function(err, data) {
				if(!err) {
					console.log('stopdoing interval: ', app.doingInterval);
					if(app.doingInterval) {
						Meteor.clearInterval(app.doingInterval);
						app.doingInterval = null;
					}
				}
			});
			break;
		case 'edit-tasktime' :
			$('[data-action][data-id="' + data.id + '"]').removeClass('hide');
			$(elem).addClass('hide');

			showHideTaskTimeInputs(data.id);
			break;
		case 'save-tasktime' :
			var $start = $('input[data-type="start"][data-id="' + data.id + '"]');
			var $end = $('input[data-type="end"][data-id="' + data.id + '"]');
			var format = Session.get('dateFormat') + ' ' + 'hh:mm:ss a';
			var startDate = moment($start.val(), format);
			var endDate = moment($end.val(), format);
			if(!startDate.isValid()) {
				alert('Start date-time is invalid. Required format is "'+ format + '"');
				break;
			}
			if(!endDate.isValid()) {
				alert('End date-time is invalid. Required format is "' + format + '"');
				break;
			}
			if((endDate - startDate) <= 0) {
				alert('End date must be greater than start date!');
				break;
			}
			var taskTimeData = {
				id : data.id,
				start : startDate.toDate(),
				end : endDate.toDate()
			};
			/**
			 * @param taskId
			 * @param taskTimeId - data.id = taskTime.position
			 */
			Meteor.call('saveTaskTime', data.taskId, taskTimeData, function(err, serverData) {
				if(!err) {
					Session.set('flashMessage', 'Task time updated.');
					$('[data-action][data-id="' + data.id + '"]').removeClass('hide');
					$(elem).addClass('hide');
					showHideTaskTimeInputs(data.id);
				} else {
					Session.set('flashMessage', 'Task time could not be updated. Try again.');
				}
			});
			break;
	}
}
