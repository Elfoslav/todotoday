/**
 * @param taskId
 * @returns doingInterval
 */
startTimeSpentInterval = function (taskId) {
  if(!taskId) {
    throw new Meteor.Error(500, 'Task id is required');
  }
  var doingInterval = Meteor.setInterval(function() {
    totalTaskTime = Meteor.call('getTotalTaskTime', taskId, function(err, data) {
      second = 1000;
      if(Session.get('timeSpent')) {
        Session.set('timeSpent', Session.get('timeSpent') + second);
      } else {
        Session.set('timeSpent', data);
      }
      return data;
    });
  }, 1000);
  return doingInterval;
};

/**
 * @param int time in milliseconds
 */
makeTime = function (totalTime) {
  var duration = moment.duration(totalTime);
  var seconds = addZero(duration.seconds());
  var minutes = addZero(duration.minutes());
  var hours = addZero(duration.hours());
  var days = duration.days();
  if(days !== 0) {
    if(days == 1) {
      return days + ' day, ' + hours + ':' + minutes + ':' + seconds;
    }
    return days + ' days, ' + hours + ':' + minutes + ':' + seconds;
  }
  return hours + ':' + minutes + ':' + seconds;
};

/**
 * Add zero if time is less than 10 eg.: 08
 * @param time - seconds, minutes, hours
 * @returns string - eg.: 08
 */
addZero = function (time) {
  return time > 9 ? time : '0' + time;
};

/**
 * Get count of taskTimes.
 * @param array taskTimes
 * @param int day - number of day in a week
 * @returns count of task.taskTimes. If day is specified
 * return taskTimes count of given day.
 */
getTaskTimesCount = function (taskTimes, day) {
  var count = 0;
  if(taskTimes) {
    if(typeof day == 'undefined') {
      return taskTimes.length;
    }
    taskTimes.forEach(function(taskTime) {
      if(taskTime.start.getDay() == day) {
        count++;
      }
    });
  }
  return count;
};

/**
 * @param array taskTimes
 * @param date
 * @returns object taskTime data containing:
 * {
    '22.02.2013' : {
      taskTimes : [{...},{...},...],
    }
    }
    if @date is not specified, returns all dates
    if @taskTimes is not specified or empty, returns empty object {}
 */
filterTaskTimesByDate = function (taskTimes, date) {
  var taskTimesData = {};
  if(taskTimes) {
    var dateFormat = Session.get('dateFormat');
    var position = 0;
    taskTimes.forEach(function(taskTime) {
      taskTime.position = position;
      position++;
      var start = moment(taskTime.start).format(dateFormat);
      var dateFormatted = moment(taskTime.start).format(dateFormat);
      if(!taskTimesData[dateFormatted]) {
        taskTimesData[dateFormatted] = {};
      }
      if(!taskTimesData[dateFormatted]['taskTimes']) {
        taskTimesData[dateFormatted]['taskTimes'] = [];
      }
      if(date) {
        if(!moment(date, dateFormat).isValid()) {
          console.log('date: ', date);
          console.log('momentDate: ', moment(date));
          throw new Meteor.Error(500, 'Date is invalid');
        }
        var dateStart = moment(date, dateFormat).toDate();
        var dateEnd = moment(date, dateFormat).hours(23).minutes(59).seconds(59).toDate();
        if(taskTime.start > dateStart && taskTime.start <= dateEnd) {
          taskTimesData[dateFormatted]['taskTimes'].push(taskTime);
        }
      } else {
        taskTimesData[dateFormatted]['taskTimes'].push(taskTime);
      }
    });
  }
  return taskTimesData;
};

/**
 * Filter taskTimes by interval (start-end)
 * @param array tasks
 * @param date startTime
 * @param date endTime
 * @returns task
 */
filterTaskTimesByTimeInterval = function(tasks, startTime, endTime) {
  if(!tasks) {
    throw new Meteor.Error(500, 'Invalid argument', tasks);
  }
  if(tasks) {
    var out = [];
    tasks.forEach(function(task) {
      if(task.taskTimes) {
        var filteredTaskTimes = [];
        task.taskTimes.forEach(function(taskTime) {
          if(taskTime.start >= startTime && taskTime.start <= endTime) {
            filteredTaskTimes.push(taskTime);
          }
        });
        task.taskTimes = filteredTaskTimes;
      }
      out.push(task);
    });
  }
  return out;
};

/**
 * Set taskTimes to task filtered by date
 * @param task
 * @param date
 * @returns task with filtered dateTimes
 */
setTaskTimesByDate = function (task, date) {
  if(!task || !date) {
    throw new Meteor.Error(500, 'Task and date parameters are required');
  }
  if(task.taskTimes) {
    var taskTimes = filterTaskTimesByDate(task.taskTimes, date);
    task.taskTimes = taskTimes[date].taskTimes;
  }
  return task;
};

/**
 * Compute total time spent on the task on the given day
 * @param array taskTimes
 * @param int day - number of day in a week
 * @returns int miliseconds of duration
 */
computeTotalDayDuration = function (taskTimes, day) {
  var duration = 0;
  if(taskTimes) {
    taskTimes.forEach(function(taskTime) {
      if(taskTime.start.getDay() == day) {
        duration = taskTime.end - taskTime.start;
      }
    });
  }
  return duration;
};

/**
 * @param int duration in milliseconds
 * @returns string duration in format [[xxh, ]xxm, ]xxs where [] is not shown if value is 0
 */
computeDuration = function (duration) {
  //moment duration
  var mDuration = moment.duration(duration);
  var out = '';
  if(mDuration.hours() > 0) {
    var hours = mDuration.hours() + 24* mDuration.days();
    out += hours + ((mDuration.minutes() > 0) ? 'h, ' : 'h ');
  }
  if(mDuration.minutes() > 0) {
    out += mDuration.minutes() + ((mDuration.seconds() > 0) ? 'm, ' : 'm ');
  }
  if(mDuration.seconds() > 0) {
    out += mDuration.seconds() + 's';
  }
  return $.trim(out);
};

/**
 * @param int duration in milliseconds
 * @returns float duration in hours computed from duration in milliseconds
 * rounded to 2 decimals
 */
computeHourDuration = function(duration) {
  var seconds = duration / 1000;
  var minutes = seconds / 60;
  var hours = minutes / 60;
  return Number(hours.toFixed(2));
}

/**
 * @param task
 * @param string view
 * @returns empty string if task or task.taskTimes is empty. Otherwise returns HTML string with task times.
 */
printTaskTimes = function(task, view) {
  var out = '';
  var lastDate = null;
  var taskTimes = TaskTimes.find({ 'task' : task._id }, { sort : { start: 1 }}).fetch();
  if(task && taskTimes) {
    var totalDuration = 0;
    var dayDuration = 0;
    var timesCount = taskTimes.length;
    var counter = 0;
    var day = null;
    var timeFormat = Session.get('timeFormat');
    var format = 'dddd MMM DD, YYYY';
    taskTimes.forEach(function(taskTime) {
      counter++;
      var nextTaskTime = taskTimes[counter];
      var currentDay = moment(taskTime.start).format(format);
      var duration = taskTime.end - taskTime.start;
      totalDuration += duration;
      dayDuration += duration;
      var startTime = moment(taskTime.start);
      var endTime = moment(taskTime.end);
      var startTimeFormat = startTime.format(timeFormat);
      var startDateTime = startTime.format(getMomentDateTimeFormat());
      var endTimeFormat = endTime.format(timeFormat);
      var endDateTime = endTime.format(getMomentDateTimeFormat());
      if(startTime.day() !== endTime.day()) {
        startTimeFormat = startTime.format('ddd ' + timeFormat);
        endTimeFormat = endTime.format('ddd ' + timeFormat);
      }
      if(day !== currentDay) {
        //print new day
        out += '<h3>' + currentDay + '</h3>';
      }
      out += '<p class="tasktime">';
        out += startTimeFormat + '\
          <input type="text" class="hide" value="' + startDateTime + '" data-type="start" data-id="' + taskTime._id + '" /> - \
           '+ endTimeFormat + '\
          <input type="text" class="hide" value="' + endDateTime + '" data-type="end" data-id="' + taskTime._id + '" />\
          , (' + computeDuration(duration) + ', (<span class="duration-' + taskTime._id + '">' + computeHourDuration(duration) + '</span>h))';
        if(view == 'taskView') {
          out += ', <a href="#" data-target="#edit-tasktime" data-toggle="modal" data-action="edit-tasktime" data-id="' + taskTime._id + '">Edit</a>\
            <a href="#save" class="hide" data-action="save-tasktime" data-id="' + taskTime._id + '" data-task-id="' + task._id + '">Save</a>';
          out += ', <a href="#add" data-action="compute-time-add" data-id="' + taskTime._id + '" data-task-id="' + task._id + '" data-day="' + moment(currentDay).format('DD-MM-YYYY') + '">+</a>';
          if(taskTime.note) {
            out += '<p>' + generateNewLines(taskTime.note) + '</p>';
          }
        }
      out += '</p>';
      day = currentDay;
      var nextTaskDay = (nextTaskTime) ? moment(nextTaskTime.start).format(format) : nextTaskTime;
      if(nextTaskDay !== day) {
        out += '<p><strong>Total: ' + computeDuration(dayDuration) + ', (' + computeHourDuration(dayDuration) + 'h)</strong> <span class="computed-time-' + moment(currentDay).format('DD-MM-YYYY') + '"></span></p>';
        dayDuration = 0;
      }
      if(timesCount == counter) {
        out += '<h3>Total: ' + computeDuration(totalDuration) + ', (' + computeHourDuration(totalDuration) + 'h)</h3>';
      }
    });
  }
  return out;
}

/**
 * @param array taskTimes
 * @returns string of history tasks or empty string
 */
printTasksHistory = function(taskTimes) {
  var out = '';
  if(taskTimes && taskTimes.length) {
    var day = null;
    var totalDuration = 0;
    var totalDayDuration = 0;
    var counter = 0;
    var format = 'dddd MMM DD, YYYY';
    taskTimes.forEach(function(taskTime) {
      counter++;
      var nextTaskTime = taskTimes[counter];
      var currentDay = moment(taskTime.start).format(format);
      if(day !== currentDay) {
        //print new day
        out += '<h3>' + currentDay + '</h3>';
      }
      out += printTaskTime(taskTime);
      day = currentDay;
      totalDayDuration += taskTime.end - taskTime.start;
      var nextTaskDay = (nextTaskTime) ? moment(nextTaskTime.start).format(format) : nextTaskTime;
      if(nextTaskDay !== day) {
        out += '<p><strong>Total: ' + computeDuration(totalDayDuration) + ', (' + computeHourDuration(totalDayDuration) + 'h)</strong></p>';
        totalDuration += totalDayDuration;
        totalDayDuration = 0;
      }
    });
    out += '<h3>Total: ' + computeDuration(totalDuration) + ', (' + computeHourDuration(totalDuration) + 'h)</h3>';
  }
  return out;
};

printTaskTime = function(taskTime) {
  var start = moment(taskTime.start).format(Session.get('timeFormat'));
  var end = moment(taskTime.end).format(Session.get('timeFormat'));
  var duration = taskTime.end - taskTime.start;
  var task = Tasks.findOne(taskTime.task);
  if(typeof taskTime.note == 'undefined') {
    console.log(taskTime.note);
    taskTime.note = '';
  }
  return '<p title="'+taskTime.note+'">' + start + ' - ' + end + ', (' + computeDuration(duration) + ', \
    (' + computeHourDuration(duration) + 'h)) &rarr; <a href="/tasks/' + task._id + '">' + task.name + '</a></p>';
};

sortTaskTimes = function(taskTime1, taskTime2) {
  return taskTime1.start - taskTime2.start;
}

sortTasksByTaskTime = function(task1, task2) {
  if(!task1) {
    throw new Meteor.Error(500, 'Invalid argument', task1);
  }
  if(!task2) {
    throw new Meteor.Error(500, 'Invalid argument', task2);
  }

  if(task1.taskTimes && task2.taskTimes) {
    return task1.taskTimes[0].start - task2.taskTimes[0].start;
  }
  return 0;
};

/**
 * @param timeFormat - time format from bootstrap datetimepicker or another plugin
 * @returns string - time format "hh:mm:ss a" or "HH:mm:ss" or given timeFormat
 */
getMomentTimeFormat = function(timeFormat) {
  switch(timeFormat) {
    case 'hh:mm:ss' :
      return 'HH:mm:ss';
    case 'HH:mm:ss PP' :
      return 'hh:mm:ss a';
    case 'hh:mm' :
      return 'HH:mm';
    case 'HH:mm PP' :
      return 'hh:mm a';
  }
  return timeFormat;
};

getMomentDateTimeFormat = function() {
  return Session.get('dateFormat') + ' ' + Session.get('timeFormat');
};

getTimePickerTimeFormat = function(timeFormat) {
  switch(timeFormat) {
    case 'HH:mm:ss' :
      return 'hh:mm:ss';
    case 'hh:mm:ss a' :
      return 'HH:mm:ss a';
    case 'HH:mm' :
      return 'hh:mm';
    case 'hh:mm a' :
      return 'HH:mm a';
  }
  return timeFormat;
};

getTimePickerDateTimeFormat = function(dateFormat, timeFormat) {
  return dateFormat + ' ' + timeFormat;
};

getDefaultDateFormat = function() {
  var settings = Settings.findOne({ user : Meteor.userId() });
  var defaultFormat = 'DD.MM.YYYY';
  if(settings && settings.dateFormat) {
    defaultFormat = settings.dateFormat;
  }
  return defaultFormat;
};

/**
 * @returns string - moment time format
 */
getDefaultTimeFormat = function() {
  var settings = Settings.findOne({ user : Meteor.userId() });
  //moment.js format
  var defaultFormat = 'hh:mm:ss a';
  if(settings && settings.timeFormat) {
    defaultFormat = settings.timeFormat;
  }
  return defaultFormat;
};

triggerAnalytics = function() {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-15567197-7', 'meteor.com');
  ga('send', 'pageview');
};

/**
 * @param string
 * @returns string new lines \n replaced by <br /> tag
 */
generateNewLines = function(str) {
  return str.replace(/\n/g, "<br />")
}

onWindowClose  = function(e) {
  var task = CurrentUserTask.findOne({ user: Meteor.userId() });
  if(task)
    return 'You are working on a task. Do you really want to close the window?';
  return undefined;
};