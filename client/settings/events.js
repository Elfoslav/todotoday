Template.settings.events({
	'change #date-format' : function(e) {
		var format = e.currentTarget.value;
		format = format.toUpperCase();
		Session.set('dateFormatExample', moment().format(format));
	},
	'change #time-format' : function(e) {
		var format = e.currentTarget.value;
		format = getMomentTimeFormat(format);
		Session.set('timeFormatExample', moment().format(format));
	},
	'click #submit' : function(e) {
		e.preventDefault();
		var dateFormat = $('#date-format').val().toUpperCase();
		var timeFormat = getMomentTimeFormat($('#time-format').val());
		var settings = {
			dateFormat : dateFormat,
			timeFormat : timeFormat
		}
		Meteor.call('saveSettings', settings, function(err, data) {
			Session.set('flashMessage', data);
		});
	}
});
