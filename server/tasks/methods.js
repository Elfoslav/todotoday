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
		return new Date();
	},
	stopDoing: function(id, doingNote) {
		currUserTask = CurrentUserTask.findOne({ task : id });

		if(currUserTask) {
			CurrentUserTask.remove({ task : id });
			TaskTimes.insert({
				task : id,
				user : this.userId,
				start: currUserTask.start,
				end: new Date(),
				note: doingNote
			});
		}
		Tasks.update(id, { $set : { doing: false }});
		return new Date();
	},
	getTotalTaskTime: function(id) {
		task = Tasks.findOne(id);
		if(!task) {
			throw new Meteor.Error(404, 'Task not found');
		}
		var taskTimes = TaskTimes.find({
			task : id
		});
		totalTime = 0;
		if(taskTimes) {
			taskTimes.forEach(function(taskTime) {
				//totalTime += taskTime.end - taskTime.start;
			});
		}

		currUserTask = CurrentUserTask.findOne({ task : id });
		if(currUserTask) {
			diff = new Date() - currUserTask.start;
			totalTime += diff;
		}
		return totalTime;
	},
	insertTaskTime : function(taskId, start, end) {
		if(!(taskId && start && end)) {
			throw new Meteor.Error(500, 'Missing "taskId" or "start" or "end" parameter');
		}
		TaskTimes.insert({
			task : taskId,
			user : this.userId,
			start : start,
			end : end
		});
	},
	updateTaskTime : function(taskId, taskTimeData) {
		if(!(taskTimeData.id && taskTimeData.start && taskTimeData.end)) {
			throw new Meteor.Error(500, 'Missing one of taskTimeData (id, start, end)');
		}
		TaskTimes.update(taskTimeData.id, {
			$set : {
				start : taskTimeData.start,
				end : taskTimeData.end
			}
		});
	},
	saveNote : function(taskTimeId, note) {
		TaskTimes.update(taskTimeId, {
			$set : {
				note : note
			}
		});
	}
});
