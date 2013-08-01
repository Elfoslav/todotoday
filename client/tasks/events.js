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
			console.log(data);
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
				console.log('data:', data);
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
		processTaskAction(e);
	}
});

Template.showTask.events({
	'click [data-action]' : function(e) {
		e.preventDefault();

		processTaskAction(e);
	},
	'submit #time-form' : function(e) {
		e.preventDefault();
		var taskId = Session.get('currentTaskId');
		var start = $('#start-time-input').val();
		var end = $('#end-time-input').val();
		if(!(start && end)) {
			alert('Fill in start and end time');
			return;
		}
		start = moment(start, getMomentDateTimeFormat()).toDate();
		console.log('start: ', start);
		console.log(getMomentDateTimeFormat());
		end = moment(end, getMomentDateTimeFormat()).toDate();
		console.log('end: ', end);
		if((end - start) <= 0) {
			alert('End time must be greater than start time.');
			return;
		}
		Meteor.call('insertTaskTime', taskId, start, end, function(err, data) {
			if(!err) {
				Session.set('flashMessage', 'Task time saved.');
				$('#start-time-input').val('');
				$('#end-time-input').val('');
			} else {
				Session.set('flashMessage', 'Task time could not be saved. Try again.');
			}
		});
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

	if(data.preventDefault == 'false') {
		//dont prevent default eg. modal close etc.
	} else {
		e.preventDefault();
	}

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
			var currUserTask = CurrentUserTask.findOne({ user : Meteor.userId() });
			if(currUserTask) {
				alert('You can\'t work on two tasks simultaneously.');
				return;
			}
			Meteor.call('startDoing', taskId, function(err, data) {
				if(!err) {
					console.log('doingIterval: ', app.doingInterval);
					if(!app.doingInterval) {
						app.doingInterval = startTimeSpentInterval(taskId);
					}
				}
				console.log('Server start date: ', data);
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
				console.log('Server end date: ', data);
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
			var format = getMomentDateTimeFormat();
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
			Meteor.call('updateTaskTime', data.taskId, taskTimeData, function(err, serverData) {
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
		//open note modal form and fill in the note
		case 'add-note' :
			var taskTime = TaskTimes.findOne(data.id);
			//set tasktime id to button
			$('#save-note-btn').data('id', data.id);
			console.log('add-note id: ', $('#save-note-btn').data('id'));
			$('#note-form textarea').val(taskTime.note);
			break;
		case 'save-note' :
			var note = $('#note-form textarea').val();
			//need to get id dynamically, data.id is empty
			var taskTimeId = $('#save-note-btn').data('id');
			Meteor.call('saveNote', taskTimeId, note);
			break;
	}
}
