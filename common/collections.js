
/**
 * Tasks:
 * {
	name: string,
	group: string (today|all),
	description: string,
	dueDate: date,
	estimatedTime: float,
	done: bool,
	doing: bool,
	user: userId
 }
 */
Tasks = new Meteor.Collection('tasks');

/**
 * CurrentUserTask - user is working on one task :
 * {
	task : taskId,
	user : userId,
	start: date,
	note: string
 }
 *
 */
CurrentUserTask = new Meteor.Collection('currentUserTask');

/*
 * TaskTimes - Task can have many start-end times :
 * {
	user: userId,
	task: taskId,
	start: date,
	end: date,
	note: string
 }
 */
TaskTimes = new Meteor.Collection('taskTimes');

/**
 * Settings:
 * {
	user : userId,
	dateFormat: string ('dd.mm.YYYY', 'mm.dd.YYYY',...)
 }
 */
Settings = new Meteor.Collection('settings');

/**
 * Todo - what to do in TodoToday
 * {
	user : userId,
	message : string
 }
 */
Todos = new Meteor.Collection('todos');

/**
 * Projects:
 * {
	name : string,
	user : userId
 }
 */
Projects = new Meteor.Collection('projects');
