Meteor.methods({
	/**
	 * @param date start of day, eg.: dd.mm.yyyy 00:00:00
	 * @param date end of day, eg.: dd.mm.yyyy 23:59:59
	 * @param string taskId
	 * @returns array
	 */
	getTaskTimesByDate: function(start, end, taskId) {
		var filter = {};
		filter.user = this.userId;
		if(start && end) {
			filter.start = { $gte: start, $lte : end };
		}
		if(taskId) {
			filter.task  = taskId;
		}
		var taskTimes = TaskTimes.find(filter,
		{
			sort : { start : 1 }
		});
		return taskTimes.fetch();
	}
});
