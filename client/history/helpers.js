
Template.history.rendered = function() {
  $('.date-month .add-on').on('click', function() {
    //hack
    $('.date-month input').focus();
  });
  $('.date-month').datetimepicker({
      format: Session.get('dateFormat'),
      viewMode: 'months',
      minViewMode: "months"
    }).on('dp.change', function(e) {
    console.log('changedate');
    $(this).data("DateTimePicker").hide();
    //date contains first day of the month. Eg.: 01.07.2013
    var date = $(this).val();
    var firstDay = moment(date, Session.get('dateFormat')).toDate();
    var lastDay = getEndMonthDate(firstDay);
    Meteor.call('getTaskTimesByDate', firstDay, lastDay, function(err, taskTimes) {
      console.log('taskTimes:', taskTimes);
      Session.set('tasksHistory', printTasksHistory(taskTimes));
    });
    Session.set('monthHistory', date);
    Session.set('dayHistory', '');
  });

  $('.date-day').datetimepicker({
      format: Session.get('dateFormat')
    }).on('dp.change', function(e) {
    console.log('changedate');
    $(this).data("DateTimePicker").hide()
    var dayHistory = $(this).val();
    var start = moment(dayHistory, Session.get('dateFormat')).toDate();
    var end = getEndDayDate(start);
    Meteor.call('getTaskTimesByDate', start, end, function(err, taskTimes) {
      Session.set('tasksHistory', printTasksHistory(taskTimes));
      Session.set('dayHistory', dayHistory);
      Session.set('monthHistory', '');
    });
  });
  changePageTitle('History of your work');
};


Template.history.helpers({
  tasksHistory : function() {
    return Session.get('tasksHistory');
  },
  dayHistory: function() {
    return Session.get('dayHistory');
  },
  monthHistory: function() {
    return Session.get('monthHistory');
  }
});
