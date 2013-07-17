Meteor.methods({
	/**
	 * @param date start of day, eg.: dd.mm.yyyy 00:00:00
	 * @param date end of day, eg.: dd.mm.yyyy 23:59:59
	 */
	getTaskTimesByDate: function(start, end) {
		var taskTimes = TaskTimes.find({
			user : this.userId,
			start: { $gte: start, $lte : end }
		},
		{
			sort : { start : 1 }
		});
		return taskTimes.fetch();
	},
	/**
	 * @param date first day of month. Eg.: 01.07.2013
	 * @param date last day of month. Eg.: 31.07.2013
	 */
	getTaskTimesByMonth : function(firstDay, lastDay) {
		var taskTimes = TaskTimes.find({
			user : this.userId,
			start: { $gte: firstDay, $lte : lastDay }
		},
		{
			sort : { start : 1 }
		});
		return taskTimes.fetch();
	}
});
