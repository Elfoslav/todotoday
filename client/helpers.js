Handlebars.registerHelper('isEqual', function(a, b, content) {
  if(a === b) {
    return content;
  }
  return '';
});

Handlebars.registerHelper('userTasksCount', function() {
  return Tasks.find({ user : Meteor.userId() }).count();
});

Handlebars.registerHelper('time', function(time, format) {
  return moment(time).format(format);
});

Handlebars.registerHelper('dateFormatUpper', function() {
  return Session.get('dateFormat');
});

Handlebars.registerHelper('dateFormatLower', function() {
  return (Session.get('dateFormat')) ? Session.get('dateFormat').toLowerCase() : '';
});

Handlebars.registerHelper('allTasksCount', function() {
  allTasksCount = Meteor.call('allTasksCount', function(err, data) {
    Session.set('allTasksCount', data);
  });

  return Session.get('allTasksCount');
});

Handlebars.registerHelper('currentTask', function() {
  var currUserTask = CurrentUserTask.findOne({ user : Meteor.userId() });
  if(currUserTask) {
    var task = Tasks.findOne(currUserTask.task);
    return new Handlebars.SafeString('Currently working on <a href="/tasks/' + currUserTask.task + '">' + task.name + '</a>');
  }
  return '';
});

Handlebars.registerHelper('totalDayTime', function() {

  var todayTaskTimes = TaskTimes.find({
    user : Meteor.userId(),
    start : { $gte: getStartDayDate(moment()), $lte: getEndDayDate(moment()) }
  });
  var totalTime = 0;
  todayTaskTimes.forEach(function(item) {
    totalTime += item.end - item.start;
  });
  return computeHourDuration(totalTime);
});