
Template.history.rendered = function() {
	$('.date-month').datepicker().on('changeDate', function(e) {
		$(this).datepicker('hide');
		//date contains first day of the month. Eg.: 01.07.2013
		var date = $(this).find('input[type="text"]').val();
		var firstDay = moment(date, Session.get('dateFormat')).toDate();
		var lastDay = getEndMonthDate(firstDay);
		Meteor.call('getTasksByMonth', firstDay, lastDay, function(err, tasks) {
			var out = '';
			if(tasks) {
				var filtered = filterTaskTimesByTimeInterval(tasks, firstDay, lastDay);
				var sorted = filtered.sort(sortTasksByTaskTime);
				sorted.forEach(function(task) {
					//out += '<h2 class="task-name"><a href="/tasks/' + task._id + '">' + task.name + '</a></h2>';
					//out += printTaskTimes(task, 'historyView');
				});
				out += printTasksHistory(tasks);
			}
			Session.set('tasksHistory', out);
		});
		Session.set('monthHistory', date);
		Session.set('dayHistory', '');
	});
	$('.date-day').datepicker().on('changeDate', function(e) {
		$(this).datepicker('hide');
		var dayHistory = $(this).find('input[type="text"]').val();
		var start = moment(dayHistory, Session.get('dateFormat')).toDate();
		var end = getEndDayDate(start);
		Meteor.call('getTasksByDate', start, end, function(err, tasks) {
			if(tasks) {
				console.log('day tasks: ', tasks);
				tasks.forEach(function(task) {
					setTaskTimesByDate(task, dayHistory);
				});
			}
			var out = printTasksHistory(tasks);
			Session.set('tasksHistory', out);
			Session.set('dayHistory', dayHistory);
			Session.set('monthHistory', '');
		});
	});
	Meteor.call('changePageTitle', 'History of your work');
};


Template.history.helpers({
	tasksHistory : function() {
		return Session.get('tasksHistory');
	},
	dayHistory: function() {
		return Session.get('dayHistory');
	},
	monthHistory: function() {
		return Session.get('monthHistory');
	}
});
