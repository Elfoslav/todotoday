Meteor.methods({
	/**
	 * @returns unique task _id
	 */
	insertTask: function(task) {
		return Tasks.insert(task);
	},
	updateTask: function(id, data) {
		if(data)
			Tasks.update(id, { $set : data });
		else
			throw new Meteor.Error(500, 'Task could not be updated, data is empty');
	},
	deleteTask: function(id) {
		Tasks.remove(id);
	},
	doneTask : function(id) {
		task = Tasks.update(id, { $set : { done : true }});
		console.log(task);
	},
	undoneTask : function(id) {
		Tasks.update(id, { $set : { done : false }});
	},
	moveTask : function(id, group) {
		if(!group) {
			group = 'all';
		}
		Tasks.update(id, { $set : { group : group }});
	},
	/**
	 * @param id - task id
	 */
	startDoing: function(id) {
		currUserTask = CurrentUserTask.findOne({ task : id });

		if(!currUserTask) {
			CurrentUserTask.insert({
				task : id,
				user : this.userId,
				start: new Date()
			});
		}
		Tasks.update(id, { $set : { doing: true }});
	},
	stopDoing: function(id) {
		currUserTask = CurrentUserTask.findOne({ task : id });

		if(currUserTask) {
			CurrentUserTask.remove({ task : id });
			Tasks.update(id,
				{
					$addToSet : {
						taskTimes: {
							start: currUserTask.start,
							end: new Date()
						}
					}
				}
			);
		}
		Tasks.update(id, { $set : { doing: false }});
	},
	getTotalTaskTime: function(id) {
		task = Tasks.findOne(id);
		if(!task) {
			throw new Meteor.Error(404, 'Task not found');
		}
		taskTimes = task.taskTimes;
		totalTime = 0;
		if(taskTimes) {
			taskTimes.forEach(function(task) {
				totalTime += task.end - task.start;
			});
		}

		currUserTask = CurrentUserTask.findOne({ task : id });
		if(currUserTask) {
			diff = new Date() - currUserTask.start;
			totalTime += diff;
		}
		return totalTime;
	},
	saveTaskTime : function(taskId, taskTimeData) {
		if(!(taskTimeData.id && taskTimeData.start && taskTimeData.end)) {
			throw new Meteor.Error(500, 'Missing one of taskTimeData (id, start, end)');
		}
		console.log('TaskTimeData: ', taskTimeData);
		var startTimeSelector = "taskTimes." + taskTimeData.id + ".start";
		var endTimeSelector = "taskTimes." + taskTimeData.id + ".end";
		//programatically creating $set modifier object
		var setModifier = { $set : {} };
		setModifier.$set[startTimeSelector] = taskTimeData.start;
		setModifier.$set[endTimeSelector] = taskTimeData.end;
		Tasks.update(taskId, setModifier);
	}
});
