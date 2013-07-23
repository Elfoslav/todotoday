Meteor.methods({
	/**
	 * @param string projectName
	 * @param array taskIds
	 * @returns string project id
	 */
	createProject : function(projectName, taskIds) {
		var projectId = Projects.insert({
			name : projectName,
			user : this.userId
		});
		taskIds.forEach(function(taskId) {
			Tasks.update(taskId, {
				$set : {
					project : projectId
				}
			});
		});
		return projectId;
	},
	/**
	 * @param object data - project data { id, name }
	 * @param array taskIds
	 * @returns string project id
	 */
	updateProject : function(data, taskIds) {
		var projectId = data.id;
		Projects.update(projectId, {
			$set : {
				name : data.name
			}
		});

		//find existing project tasks
		var projectTasks = Tasks.find({ project : projectId });
		projectTasks.forEach(function(task) {
			if(taskIds.indexOf(task._id) == -1) {
				//task id not found, so remove task from the project
				Tasks.update(task._id, {
					$set : {
						project : null
					}
				});
			}
		});

		taskIds.forEach(function(taskId) {
			Tasks.update(taskId, {
				$set : {
					project : projectId
				}
			});
		});
		return projectId;
	}
});
