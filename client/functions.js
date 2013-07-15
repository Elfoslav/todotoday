/**
 * @param taskId
 * @returns doingInterval
 */
startTimeSpentInterval = function (taskId) {
	if(!taskId) {
		throw new Meteor.Error(500, 'Task id is required');
	}
	var doingInterval = Meteor.setInterval(function() {
		totalTaskTime = Meteor.call('getTotalTaskTime', taskId, function(err, data) {
			second = 1000;
			if(Session.get('timeSpent')) {
				Session.set('timeSpent', Session.get('timeSpent') + second);
			} else {
				Session.set('timeSpent', data);
			}
			return data;
		});
	}, 1000);
	return doingInterval;
};

/**
 * @param int time in milliseconds
 */
makeTime = function (totalTime) {
	var duration = moment.duration(totalTime);
	var seconds = addZero(duration.seconds());
	var minutes = addZero(duration.minutes());
	var hours = addZero(duration.hours());
	var days = duration.days();
	if(days !== 0) {
		if(days == 1) {
			return days + ' day, ' + hours + ':' + minutes + ':' + seconds;
		}
		return days + ' days, ' + hours + ':' + minutes + ':' + seconds;
	}
	return hours + ':' + minutes + ':' + seconds;
};

/**
 * Add zero if time is less than 10 eg.: 08
 * @param time - seconds, minutes, hours
 * @returns string - eg.: 08
 */
addZero = function (time) {
	return time > 9 ? time : '0' + time;
};

/**
 * Get count of taskTimes.
 * @param array taskTimes
 * @param int day - number of day in a week
 * @returns count of task.taskTimes. If day is specified
 * return taskTimes count of given day.
 */
getTaskTimesCount = function (taskTimes, day) {
	var count = 0;
	if(taskTimes) {
		if(typeof day == 'undefined') {
			return taskTimes.length;
		}
		taskTimes.forEach(function(taskTime) {
			if(taskTime.start.getDay() == day) {
				count++;
			}
		});
	}
	return count;
};

/**
 * @param array taskTimes
 * @param date
 * @returns object taskTime data containing:
 * {
		'22.02.2013' : {
			taskTimes : [{...},{...},...],
		}
    }
    if @date is not specified, returns all dates
    if @taskTimes is not specified or empty, returns empty object {}
 */
filterTaskTimesByDate = function (taskTimes, date) {
	var taskTimesData = {};
	if(taskTimes) {
		var dateFormat = Session.get('dateFormat');
		var position = 0;
		taskTimes.forEach(function(taskTime) {
			taskTime.position = position;
			position++;
			var start = moment(taskTime.start).format(dateFormat);
			var dateFormatted = moment(taskTime.start).format(dateFormat);
			if(!taskTimesData[dateFormatted]) {
				taskTimesData[dateFormatted] = {};
			}
			if(!taskTimesData[dateFormatted]['taskTimes']) {
				taskTimesData[dateFormatted]['taskTimes'] = [];
			}
			if(date) {
				if(!moment(date, dateFormat).isValid()) {
					console.log('date: ', date);
					console.log('momentDate: ', moment(date));
					throw new Meteor.Error(500, 'Date is invalid');
				}
				var dateStart = moment(date, dateFormat).toDate();
				var dateEnd = moment(date, dateFormat).hours(23).minutes(59).seconds(59).toDate();
				if(taskTime.start > dateStart && taskTime.start <= dateEnd) {
					taskTimesData[dateFormatted]['taskTimes'].push(taskTime);
				}
			} else {
				taskTimesData[dateFormatted]['taskTimes'].push(taskTime);
			}
		});
	}
	return taskTimesData;
};

/**
 * Filter taskTimes by interval (start-end)
 * @param array tasks
 * @param date startTime
 * @param date endTime
 * @returns task
 */
filterTaskTimesByTimeInterval = function(tasks, startTime, endTime) {
	if(!tasks) {
		throw new Meteor.Error(500, 'Invalid argument', tasks);
	}
	if(tasks) {
		var out = [];
		tasks.forEach(function(task) {
			if(task.taskTimes) {
				var filteredTaskTimes = [];
				task.taskTimes.forEach(function(taskTime) {
					if(taskTime.start >= startTime && taskTime.start <= endTime) {
						filteredTaskTimes.push(taskTime);
					}
				});
				task.taskTimes = filteredTaskTimes;
			}
			out.push(task);
		});
	}
	return out;
};

/**
 * Set taskTimes to task filtered by date
 * @param task
 * @param date
 * @returns task with filtered dateTimes
 */
setTaskTimesByDate = function (task, date) {
	if(!task || !date) {
		throw new Meteor.Error(500, 'Task and date parameters are required');
	}
	if(task.taskTimes) {
		var taskTimes = filterTaskTimesByDate(task.taskTimes, date);
		task.taskTimes = taskTimes[date].taskTimes;
	}
	return task;
};

/**
 * Compute total time spent on the task on the given day
 * @param array taskTimes
 * @param int day - number of day in a week
 * @returns int miliseconds of duration
 */
computeTotalDayDuration = function (taskTimes, day) {
	var duration = 0;
	if(taskTimes) {
		taskTimes.forEach(function(taskTime) {
			if(taskTime.start.getDay() == day) {
				duration = taskTime.end - taskTime.start;
			}
		});
	}
	return duration;
};

/**
 * @param int duration in milliseconds
 * @returns string duration in format [[xxh, ]xxm, ]xxs where [] is not shown if value is 0
 */
computeDuration = function (duration) {
	//moment duration
	var mDuration = moment.duration(duration);
	var out = '';
	if(mDuration.days() > 0) {
		out += mDuration.days() + 'd, ';
	}
	if(mDuration.hours() > 0) {
		out += mDuration.hours() + ((mDuration.minutes() > 0) ? 'h, ' : 'h');
	}
	if(mDuration.minutes() > 0) {
		out += mDuration.minutes() + ((mDuration.seconds() > 0) ? 'm, ' : 'm');
	}
	if(mDuration.seconds() > 0) {
		out += mDuration.seconds() + 's';
	}
	return out;
};

/**
 * @param task
 * @param string view
 * @returns empty string if task or task.taskTimes is empty. Otherwise returns HTML string with task times.
 */
printTaskTimes = function(task, view) {
	var out = '';
	var lastDate = null;
	if(task && task.taskTimes) {
		var sorted = task.taskTimes.sort(sortTaskTimes);
		var taskTimesData = filterTaskTimesByDate(sorted);
		for(var key in taskTimesData) {
			out += '<h3 class="task-day">' + moment(key, Session.get('dateFormat')).format('dddd MMMM DD, YYYY') + '</h3>'
			if(taskTimesData[key].taskTimes){
				var totalCount = taskTimesData[key].taskTimes.length;
				var totalDuration = 0;
				var counter = 0;
				var timeFormat = 'hh:mm:ss a';
				taskTimesData[key].taskTimes.forEach(function(taskTime) {
					counter++;
					totalDuration += taskTime.end - taskTime.start;
					var duration = taskTime.end - taskTime.start;
					var startTime = moment(taskTime.start);
					var endTime = moment(taskTime.end);
					var startTimeFormat = startTime.format(timeFormat);
					var startDateTime = startTime.format(Session.get('dateFormat') + ' ' + timeFormat);
					var endTimeFormat = endTime.format(timeFormat);
					var endDateTime = endTime.format(Session.get('dateFormat') + ' ' + timeFormat);
					if(startTime.day() !== endTime.day()) {
						startTimeFormat = startTime.format('ddd hh:mm:ss a');
						endTimeFormat = endTime.format('ddd hh:mm:ss a');
					}
					out += '<p><strong>Start:</strong> ' + startTimeFormat + '\
						<input type="text" class="hide" value="' + startDateTime + '" data-type="start" data-id="' + taskTime.position + '" /> - \
						<strong>End:</strong> '+ endTimeFormat + '\
						<input type="text" class="hide" value="' + endDateTime + '" data-type="end" data-id="' + taskTime.position + '" />\
						| <strong>Duration:</strong>  ' + computeDuration(duration);
					if(view !== 'historyView') {
						out += ', <a href="#edit" data-action="edit-tasktime" data-id="' + taskTime.position + '">Edit</a>\
							<a href="#save" class="hide" data-action="save-tasktime" data-id="' + taskTime.position + '" data-task-id="' + task._id + '">Save</a></p>';
					}
					if(counter == totalCount) {
						out += '<p><strong>Total: ' + computeDuration(totalDuration) + '</strong></p>';
					}
				});
			}
		}
	}
	return out;
}

/**
 * @param tasks
 * @param string time format
 * @returns string of history tasks or empty string if no tasks found
 */
printTasksHistory = function(tasks, timeFormat) {
	var out = '';
	var dateTimeFormat = timeFormat || 'hh:mm:ss a';
	if(tasks && tasks.length) {
		var totalDuration = 0;
		tasks.forEach(function(task) {
			out += '<h2 class="task-name"><a href="/tasks/' + task._id + '">' + task.name + '</a></h2>';
			if(task.taskTimes) {
				var taskTotalDuration = 0;
				var counter = 0;
				var taskTimesCount = task.taskTimes.length;
				task.taskTimes.forEach(function(taskTime) {
					counter++;
					taskTotalDuration += taskTime.end - taskTime.start;

					var duration = computeDuration(durationMilis);
					out += '<p><strong>Start:</strong> ' + moment(taskTime.start).format(dateTimeFormat) + ' - <strong>End:</strong> ' + moment(taskTime.end).format(dateTimeFormat) + ' | <strong>Duration:</strong> ' + duration + '</p>';
					if(counter == taskTimesCount) {
						out += '<p><strong>Total: ' + computeDuration(taskTotalDuration) + '</strong></p>';
					}
				});
				totalDuration += taskTotalDuration;
			}
			//out += printTaskTimes(task);
		});
		out += '<h3>Total time spent: ' + computeDuration(totalDuration) + '</h3>';
	}
	return out;
};

showHideTaskTimeInputs = function(id) {
	var $inputs = $('input[data-id="' + id + '"]');
	$inputs.each(function(i, input) {
		$(input).toggleClass('hide');
	});
};

sortTaskTimes = function(taskTime1, taskTime2) {
	return taskTime1.start - taskTime2.start;
}

sortTasksByTaskTime = function(task1, task2) {
	if(!task1) {
		throw new Meteor.Error(500, 'Invalid argument', task1);
	}
	if(!task2) {
		throw new Meteor.Error(500, 'Invalid argument', task2);
	}

	if(task1.taskTimes && task2.taskTimes) {
		return task1.taskTimes[0].start - task2.taskTimes[0].start;
	}
	return 0;
};

triggerAnalytics = function() {
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-15567197-7', 'meteor.com');
	ga('send', 'pageview');
};
