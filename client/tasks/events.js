var deleteTaskEvent = {
  'click [data-event]' : function(e) {
    e.preventDefault();
    console.log('data event: '+$(this).data('event'));
  }
};

Template.taskForm.events({
  'click #submit' : function(e) {
    e.preventDefault();

    if ($('#name').val()) {
      name = $('#name').val();
      description = $('#description').val();
      //JSON data
      data = $('#frm-task').serializeObject();
      console.log(data);
      //if checkbox done is not checked, set default done = false
      if (!data.done) {
        data.done = false;
      } else {
        data.done = true;
      }
      if (data.project == '0') {
        data.project = null;
      }
      if (data.dueDate) {
        data.dueDate = moment(data.dueDate, Session.get('dateFormat')).toDate();
      }

      if(Session.get('taskAction') == 'Add') {
        console.log('data:', data);
        Meteor.call('insertTask', data, function(err, taskId) {
          Router.go('/tasks/'+taskId);
        });
      }
      if(Session.get('taskAction') == 'Edit') {
        var taskId = Session.get('taskEditId');
        Meteor.call('updateTask', taskId, data);
        redirectTask();
        Session.set('flashMessage', 'Task saved');
      }
    } else {
      $('#name').focus();
    }
  },
  'click #cancel' : function(e) {
    e.preventDefault();

    redirectTask();
  }
});

Template.tasks.events({
  'click [data-action]' : function(e) {
    processTaskAction(e);
  }
});

Template.showTask.events({
  'click [data-action]' : function(e) {
    e.preventDefault();

    processTaskAction(e);
  },
  'submit #time-form' : function(e) {
    e.preventDefault();
    var taskId = Session.get('currentTaskId');
    var start = $('#start-time-input').val();
    var end = $('#end-time-input').val();
    var note = $('#time-form').find('textarea[name="note"]').val();

    if(!(start && end)) {
      alert('Fill in start and end time');
      return;
    }
    start = moment(start, getMomentDateTimeFormat()).toDate();
    console.log('start: ', start);
    console.log(getMomentDateTimeFormat());
    end = moment(end, getMomentDateTimeFormat()).toDate();
    console.log('end: ', end);
    if((end - start) <= 0) {
      alert('End time must be greater than start time.');
      return;
    }
    Meteor.call('insertTaskTime', taskId, start, end, note, function(err, data) {
      if(!err) {
        Session.set('flashMessage', 'Task time saved.');
        $('#start-time-input').val('');
        $('#end-time-input').val('');
        $('#time-form textarea[name="note"]').val('');
      } else {
        Session.set('flashMessage', 'Task time could not be saved. Try again.');
      }
    });
  },
  'focusout #doing-note': function() {
    Meteor.call('updateCurrentTask', currUserTask._id, { note: $('#doing-note').val() });
  }
});

function redirectTask() {
  var id = getURLParameter('id');
  if(id !== 'null') {
    //back to task
    Router.go('/tasks/'+id);
  }
  else {
    Router.go('/tasks');
  }
}

/**
 *@param event
 */
function processTaskAction(e) {
  elem = e.currentTarget;
  data = elem.dataset;

  if(data.preventDefault == 'false') {
    //dont prevent default eg. modal close etc.
  } else {
    e.preventDefault();
  }

  switch(data.action) {
    case 'delete' :
      if(confirm('Do you want to delete this task?')) {
        Meteor.call('deleteTask', data.id);
        Session.set('flashMessage', 'Task removed');
        if(Session.get('currentTaskId'))
          Router.go('/tasks');
      }
      break;
    case 'done' :
      Meteor.call('doneTask', data.id);
      if(!Session.get('currentTaskId')) {
        Session.set('flashMessage', 'Task has been marked as done');
      }
      break;
    case 'undone' :
      Meteor.call('undoneTask', data.id);
      if(!Session.get('currentTaskId')) {
        Session.set('flashMessage', 'Task has been marked as undone');
      }
      break;
    case 'move' :
      var group = data.group;
      Meteor.call('moveTask', data.id, group, function(err, data) {
        if(!err) {
          Session.set('flashMessage', 'Task moved to "' + group + '"');
        }
      });
      break;
    case 'startdoing' :
      var taskId = data.id;
      var currUserTask = CurrentUserTask.findOne({ user : Meteor.userId() });
      if(currUserTask) {
        alert('You can\'t work on two tasks simultaneously.');
        return;
      }
      Meteor.call('startDoing', taskId, function(err, data) {
        if(!err) {
          console.log('doingIterval: ', app.doingInterval);
          if(!app.doingInterval) {
            app.doingInterval = startTimeSpentInterval(taskId);
          }
        }
        console.log('Server start date: ', data);
      });
      break;
    case 'stopdoing' :
      var doingNote = $('#doing-note').val();
      Meteor.call('stopDoing', data.id, doingNote, function(err, data) {
        if(!err) {
          console.log('stopdoing interval: ', app.doingInterval);
          if(app.doingInterval) {
            Meteor.clearInterval(app.doingInterval);
            app.doingInterval = null;
          }
        }
        console.log('Server end date: ', data);
      });
      break;
    //open edit task time modal
    case 'edit-tasktime' :
      var $taskTimeRow = $(elem).closest('.tasktime');
      $('#edit-start-time, #edit-end-time').datetimepicker({
        format: getTimePickerDateTimeFormat(Session.get('dateFormat'), Session.get('timeFormat'))
      });
      //fill in start time in modal dialog
      $('#edit-start-time').data('DateTimePicker').setDate(moment($('input[data-type="start"]', $taskTimeRow).val(), getMomentDateTimeFormat()).toDate());
      $('#edit-end-time').data('DateTimePicker').setDate(moment($('input[data-type="end"]', $taskTimeRow).val(), getMomentDateTimeFormat()).toDate());

      var taskTime = TaskTimes.findOne(data.id);
      $('#edit-tasktime-form textarea[name="note"]').val(taskTime.note);
      $('#save-tasktime-btn').data('id', data.id);
      break;
    case 'save-tasktime' :
      var $start = $('#edit-start-time');
      var $end = $('#edit-end-time');
      var format = getMomentDateTimeFormat();
      var startDate = moment($start.val(), format);
      var endDate = moment($end.val(), format);
      var note = $('#edit-tasktime-form textarea[name="note"]').val();

      if(!startDate.isValid()) {
        alert('Start date-time is invalid. Required format is "'+ format + '"');
        break;
      }
      if(!endDate.isValid()) {
        alert('End date-time is invalid. Required format is "' + format + '"');
        break;
      }
      if((endDate - startDate) <= 0) {
        alert('End date must be greater than start date!');
        break;
      }
      var taskTimeData = {
        id : $('#save-tasktime-btn').data('id'),
        start : startDate.toDate(),
        end : endDate.toDate(),
        note: note
      };
      /**
       * @param taskId
       * @param taskTimeId - data.id = taskTime.position
       */
      Meteor.call('updateTaskTime', data.taskId, taskTimeData, function(err, serverData) {
        if(!err) {
          Session.set('flashMessage', 'Task time updated.');
        } else {
          Session.set('flashMessage', 'Task time could not be updated. Try again.');
        }
      });
      //manually hide modal
      $('#edit-tasktime').modal('hide');
      break;
    //compute task time
    case 'compute-time-add' :
      var duration = $('.duration-' + data.id).text();
      var $result = $('.computed-time-' + data.day);
      console.log($result);
      if($result.text()) {
        $result.text(parseFloat($result.text()) + parseFloat(duration));
      } else {
        $result.text(parseFloat(duration));
      }
      //$(elem).data('action', 'compute-time-subtract');
      $(elem).attr('data-action', 'compute-time-subtract');
      $(elem).text('-');
      break;
    case 'compute-time-subtract' :
      var duration = $('.duration-' + data.id).text();
      var $result = $('.computed-time-' + data.day);
      console.log($result);
      if($result.text()) {
        $result.text(parseFloat($result.text()) - parseFloat(duration));
      } else {
        $result.text(parseFloat(duration));
      }
      //$(elem).data('action', 'compute-time-add');
      $(elem).attr('data-action', 'compute-time-add');
      $(elem).text('+');
      break;
  }
}
