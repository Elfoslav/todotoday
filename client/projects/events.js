Template.projectForm.events({
	'submit #projectForm' : function(e) {
		e.preventDefault();
		var projectName = $('#name').val();
		if(projectName == '') {
			alert('Project name is required');
			$('#name').focus();
			return;
		}

		//collect checked task ids
		var taskIds = [];
		$('.projectTask:checked').each(function() {
			taskIds.push($(this).val());
		});

		var projectId = Session.get('projectEditId');
		if(projectId) {
			//edit project
			var data = {
				id : projectId,
				name : projectName
			};
			Meteor.call('updateProject', data, taskIds, function(err, data) {
				if(!err) {
					Session.set('flashMessage', 'Project updated.');
					Router.go('/projects/' + projectId);
				}
			});
		} else {
			//create new project
			Meteor.call('createProject', projectName, taskIds, function(err, projectId) {
				if(!err) {
					Session.set('flashMessage', 'Project created.');
					Router.go('/projects/' + projectId);
				}
			});
		}
	},
	"click .select-all" : function(e) {
		var target = e.currentTarget;
		$('.projectTask').prop('checked', target.checked);
	}
});
