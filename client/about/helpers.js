Template.about.rendered = function() {
	Meteor.call('changePageTitle', "About");
	triggerAnalytics();
};
