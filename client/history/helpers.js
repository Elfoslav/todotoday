
Template.history.rendered = function() {
	$('.date-month').datepicker().on('changeDate', function(e) {
		$(this).datepicker('hide');
		//date contains first day of the month. Eg.: 01.07.2013
		var date = $(this).find('input[type="text"]').val();
		var firstDay = moment(date, Session.get('dateFormat')).toDate();
		var lastDay = getEndMonthDate(firstDay);
		console.log('firstDay: ', firstDay);
		console.log('lastDay: ', lastDay);
		Meteor.call('getTaskTimesByDate', firstDay, lastDay, function(err, taskTimes) {
			Session.set('tasksHistory', printTasksHistory(taskTimes));
		});
		Session.set('monthHistory', date);
		Session.set('dayHistory', '');
	});
	$('.date-day').datepicker().on('changeDate', function(e) {
		$(this).datepicker('hide');
		var dayHistory = $(this).find('input[type="text"]').val();
		var start = moment(dayHistory, Session.get('dateFormat')).toDate();
		var end = getEndDayDate(start);
		Meteor.call('getTaskTimesByDate', start, end, function(err, taskTimes) {
			Session.set('tasksHistory', printTasksHistory(taskTimes));
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
