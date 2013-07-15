Template.settings.rendered = function() {
	Meteor.call('changePageTitle', "Settings");
};

Template.settings.helpers({
	dateFormatExample : function() {
		var defaultFormat = getDefaultFormat();
		return Session.get('dateFormatExample') ? Session.get('dateFormatExample') : moment().format(defaultFormat);
	},
	dateFormat : function() {
		return getDefaultFormat();
	}
});

function getDefaultFormat() {
	var settings = Settings.findOne( { user : Meteor.userId() });
	var defaultFormat = 'DD.MM.YYYY';
	if(settings && settings.dateFormat) {
		defaultFormat = settings.dateFormat;
	}
	return defaultFormat;
}
