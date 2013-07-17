Meteor.methods({
	saveSettings: function(settings) {
		var settingsCollection = Settings.findOne({ user : this.userId });
		if(!settingsCollection) {
			Settings.insert({
				user: this.userId,
				dateFormat: settings.dateFormat,
				timeFormat: settings.timeFormat
			});
		} else {
			Settings.update(settingsCollection._id,
				{ $set : {
					dateFormat : settings.dateFormat,
					timeFormat : settings.timeFormat
				}}
			);
		}
		return 'Settings saved';
	}
});
