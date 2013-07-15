Meteor.methods({
	saveSettings: function(options) {
		var format = options.dateFormat;
		var settings = Settings.findOne({ user : this.userId });
		if(!settings) {
			Settings.insert({
				user: this.userId,
				dateFormat: format
			});
		} else {
			Settings.update(settings._id,
				{ $set : { dateFormat : format }}
			);
		}
		return 'Settings saved';
	}
});
