const Task = require("../models/Task.model");
const StudyPlan = require("../models/StudyPlan.model");
const reminderScheduler = require("../services/reminderScheduler");

const validateTaskTitle = (title) => {
  const cleanedTitle = title?.replace(/\s+/g, " ").trim();

  if (!cleanedTitle) {
    return { valid: false, message: "Task name is required" };
  }

  if (cleanedTitle.length < 3) {
    return { valid: false, message: "Task name must be at least 3 characters" };
  }

  if (cleanedTitle.length > 60) {
    return { valid: false, message: "Task name must be less than 60 characters" };
  }

  if (!/[a-zA-Z0-9]/.test(cleanedTitle)) {
    return { valid: false, message: "Task name must contain at least one letter or number" };
  }

  if (!/^[a-zA-Z0-9\s.,()&-]+$/.test(cleanedTitle)) {
    return { valid: false, message: "Task name contains invalid characters" };
  }

  return { valid: true, cleanedTitle };
};

const validateTaskDate = (date) => {
  if (!date) {
    return { valid: false, message: "Task date is required" };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { valid: false, message: "Task date must be in YYYY-MM-DD format" };
  }

  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  const isRealDate =
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day;

  if (!isRealDate) {
    return { valid: false, message: "Task date must be a valid calendar date" };
  }

  const today = new Date();
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (parsed < localToday) {
    return { valid: false, message: "Past dates are not allowed" };
  }

  return { valid: true, cleanedDate: date };
};

const validateTaskTime = (time) => {
  if (!time) {
    return { valid: false, message: "Task time is required" };
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    return { valid: false, message: "Task time must be in HH:MM format" };
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (hours < 0 || hours > 23) {
    return { valid: false, message: "Hour must be between 00 and 23" };
  }

  if (minutes < 0 || minutes > 59) {
    return { valid: false, message: "Minutes must be between 00 and 59" };
  }

  return { valid: true, cleanedTime: time };
};

const validateReminder = ({ hasReminder, reminderDateTime, taskDate, taskTime }) => {
  if (!hasReminder) {
    return { valid: true, cleanedReminderDateTime: null };
  }

  if (!reminderDateTime) {
    return { valid: false, message: "Reminder date and time is required" };
  }

  const parsedReminder = new Date(reminderDateTime);
  if (Number.isNaN(parsedReminder.getTime())) {
    return { valid: false, message: "Reminder date and time is invalid" };
  }

  const now = new Date();
  if (parsedReminder < now) {
    return { valid: false, message: "Reminder date and time cannot be in the past" };
  }

  const [year, month, day] = taskDate.split("-").map(Number);
  const [hours, minutes] = taskTime.split(":").map(Number);
  const taskDateTime = new Date(year, month - 1, day, hours, minutes);

  const sixHoursBeforeTask = new Date(taskDateTime.getTime() - 6 * 60 * 60 * 1000);

  if (parsedReminder > sixHoursBeforeTask) {
    return { valid: false, message: "Reminder must be at least 6 hours before the task time" };
  }

  return { valid: true, cleanedReminderDateTime: parsedReminder };
};

// Add Task
const addTask = async (req, res) => {
  try {
    const userId = req.user.id;

    const plan = await StudyPlan.findOne({
      _id: req.params.planId,
      user: userId,
    });

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const titleValidation = validateTaskTitle(req.body.title);
    if (!titleValidation.valid) {
      return res.status(400).json({ message: titleValidation.message });
    }

    const dateValidation = validateTaskDate(req.body.date);
    if (!dateValidation.valid) {
      return res.status(400).json({ message: dateValidation.message });
    }

    const timeValidation = validateTaskTime(req.body.time);
    if (!timeValidation.valid) {
      return res.status(400).json({ message: timeValidation.message });
    }

    const hasReminder = req.body.hasReminder === true;
    const isImportant = req.body.isImportant === true;

    const reminderValidation = validateReminder({
      hasReminder,
      reminderDateTime: req.body.reminderDateTime,
      taskDate: dateValidation.cleanedDate,
      taskTime: timeValidation.cleanedTime,
    });

    if (!reminderValidation.valid) {
      return res.status(400).json({ message: reminderValidation.message });
    }

    const existingTask = await Task.findOne({
      plan: req.params.planId,
      date: dateValidation.cleanedDate,
      time: timeValidation.cleanedTime,
    });

    if (existingTask) {
      return res.status(400).json({
        message: "A task already exists for this date and time slot",
      });
    }

    const task = await Task.create({
      plan: req.params.planId,
      title: titleValidation.cleanedTitle,
      date: dateValidation.cleanedDate,
      time: timeValidation.cleanedTime,
      isImportant,
      hasReminder,
      reminderDateTime: reminderValidation.cleanedReminderDateTime,
      reminderSent: false,
    });

    plan.tasks.push(task._id);
    await plan.save();

    // Schedule reminder if enabled
    if (hasReminder) {
      await reminderScheduler.addReminder(task);
    }

    const updatedPlan = await StudyPlan.findOne({
      _id: req.params.planId,
      user: userId,
    }).populate("tasks");

    res.status(201).json(updatedPlan);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
  }
};

// Get All Tasks for a Plan
const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const plan = await StudyPlan.findOne({
      _id: req.params.planId,
      user: userId,
    }).populate("tasks");

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    res.json(plan.tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Single Task
const getTask = async (req, res) => {
  try {
    const userId = req.user.id;

    const plan = await StudyPlan.findOne({
      _id: req.params.planId,
      user: userId,
    });

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.plan.toString() !== req.params.planId) {
      return res.status(404).json({ message: "Task not found in this plan" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Task
const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;

    const plan = await StudyPlan.findOne({
      _id: req.params.planId,
      user: userId,
    });

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.plan.toString() !== req.params.planId) {
      return res.status(404).json({ message: "Task not found in this plan" });
    }

    let cleanedTitle = task.title;
    let cleanedDate = task.date;
    let cleanedTime = task.time;
    let isImportant = task.isImportant;
    let hasReminder = task.hasReminder;
    let reminderDateTime = task.reminderDateTime;

    if (req.body.title !== undefined) {
      const titleValidation = validateTaskTitle(req.body.title);
      if (!titleValidation.valid) {
        return res.status(400).json({ message: titleValidation.message });
      }
      cleanedTitle = titleValidation.cleanedTitle;
    }

    if (req.body.date !== undefined) {
      const dateValidation = validateTaskDate(req.body.date);
      if (!dateValidation.valid) {
        return res.status(400).json({ message: dateValidation.message });
      }
      cleanedDate = dateValidation.cleanedDate;
    }

    if (req.body.time !== undefined) {
      const timeValidation = validateTaskTime(req.body.time);
      if (!timeValidation.valid) {
        return res.status(400).json({ message: timeValidation.message });
      }
      cleanedTime = timeValidation.cleanedTime;
    }

    if (req.body.isImportant !== undefined) {
      isImportant = req.body.isImportant === true;
    }

    if (req.body.hasReminder !== undefined) {
      hasReminder = req.body.hasReminder === true;
    }

    if (req.body.reminderDateTime !== undefined) {
      reminderDateTime = req.body.reminderDateTime;
    }

    const reminderValidation = validateReminder({
      hasReminder,
      reminderDateTime,
      taskDate: cleanedDate,
      taskTime: cleanedTime,
    });

    if (!reminderValidation.valid) {
      return res.status(400).json({ message: reminderValidation.message });
    }

    const conflictingTask = await Task.findOne({
      plan: req.params.planId,
      date: cleanedDate,
      time: cleanedTime,
      _id: { $ne: req.params.taskId },
    });

    if (conflictingTask) {
      return res.status(400).json({
        message: "Another task already exists for this date and time slot",
      });
    }

    task.title = cleanedTitle;
    task.date = cleanedDate;
    task.time = cleanedTime;
    task.isImportant = isImportant;
    task.hasReminder = hasReminder;
    task.reminderDateTime = reminderValidation.cleanedReminderDateTime;

    if (req.body.status !== undefined) task.status = req.body.status;

    await task.save();

    // Update reminder if changed
    await reminderScheduler.updateReminder(task);

    const updatedPlan = await StudyPlan.findOne({
      _id: req.params.planId,
      user: userId,
    }).populate("tasks");

    res.json(updatedPlan);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
  }
};

// Delete Task
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;

    const plan = await StudyPlan.findOne({
      _id: req.params.planId,
      user: userId,
    });

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.plan.toString() !== req.params.planId) {
      return res.status(404).json({ message: "Task not found in this plan" });
    }

    // Delete scheduled reminder if any
    await reminderScheduler.deleteReminder(req.params.taskId);

    await Task.findByIdAndDelete(req.params.taskId);

    await StudyPlan.findByIdAndUpdate(req.params.planId, {
      $pull: { tasks: req.params.taskId },
    });

    const updatedPlan = await StudyPlan.findOne({
      _id: req.params.planId,
      user: userId,
    }).populate("tasks");

    res.json(updatedPlan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addTask, getTasks, getTask, updateTask, deleteTask };