Template.settings.events({
	'change #date-format' : function(e) {
		var format = e.currentTarget.value;
		format = format.toUpperCase();
		Session.set('dateFormatExample', moment().format(format));
	},
	'click #submit' : function(e) {
		e.preventDefault();
		var format = $('#date-format').val();
		format = format.toUpperCase();
		Meteor.call('saveSettings', { dateFormat : format }, function(err, data) {
			Session.set('flashMessage', data);
		});
	}
});
