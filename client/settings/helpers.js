Template.settings.rendered = function() {
  changePageTitle("Settings");
};

Template.settings.helpers({
  dateFormatExample : function() {
    var defaultFormat = getDefaultDateFormat();
    return Session.get('dateFormatExample') ? Session.get('dateFormatExample') : moment().format(defaultFormat);
  },
  timeFormatExample : function() {
    var defaultFormat = getDefaultTimeFormat();
    return Session.get('timeFormatExample') ? Session.get('timeFormatExample') : moment().format(defaultFormat);
  },
  dateFormat : function() {
    return getDefaultDateFormat();
  },
  timeFormat : function() {
    return Session.get('timeFormat');
  }
});
