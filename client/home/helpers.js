Template.home.rendered = function() {
	Meteor.call('changePageTitle', "Task & time management web app");
	triggerAnalytics();
};
