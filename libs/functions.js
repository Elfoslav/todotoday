getURLParameter = function(name) {
	return decodeURI(
		(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	);
}

/**
 * Filter taskTimes of task collection
 * @return tasks with filtered taskTimes or null if tasks is empty
 */
filterTasksTimes = function(tasks, startTime, endTime) {
	if(!tasks) {
		return null;
	}
	var result = null;
	tasks.forEach(function(task){
		result = filterTaskTimes(task, startTime, endTime);
	});
	return result;
}

/**
 * Filter task times
 * @returns task or null if task is empty or has no taskTimes
 */
filterTaskTimes = function(task, startTime, endTime) {
	if(!task || !task.taskTimes) {
		return null;
	}
	var times = new Array();
	task.taskTimes.forEach(function(taskTime) {
		if(taskTime.start >= startTime && taskTime.end <= endTime) {
			times.push(taskTime);
		}
	});
	task.taskTimes = times;
	return task;
}

/**
 * @param date object of Date
 * @returns date end of day, eg.: 01.07.2013 00:00:00
 */
getStartDayDate = function(date) {
	var firstDay = moment(date, Session.get('dateFormat')).clone();
	return firstDay.hours(0).minutes(0).seconds(0).toDate();
}

/**
 * @param date object of Date
 * @returns date end of day, eg.: 01.07.2013 23:59:59
 */
getEndDayDate = function(date) {
	var clone = moment(date).clone();
	return clone.hours(23).minutes(59).seconds(59).toDate();
};

/**
 * @param date object of Date
 * @returns date last day of the month, eg.: 31.07.2013 23:59:59
 */
getEndMonthDate = function(date) {
	var clone = moment(date).clone();
	clone.add('months', 1).date(0).hours(23).minutes(59).seconds(59);
	return clone.toDate();
};
