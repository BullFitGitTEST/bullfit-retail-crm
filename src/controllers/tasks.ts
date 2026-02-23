import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { CreateTaskDto, UpdateTaskDto } from '../models/task';
import logger from '../utils/logger';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { assigned_to, status, priority, prospect_id } = req.query;

    let query = supabase.from('tasks').select('*, prospects(business_name)');

    if (assigned_to) query = query.eq('assigned_to', assigned_to as string);
    if (status) query = query.eq('status', status as string);
    if (priority) query = query.eq('priority', priority as string);
    if (prospect_id) query = query.eq('prospect_id', prospect_id as string);

    query = query.order('due_date', { ascending: true, nullsFirst: false });

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch tasks', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('tasks')
      .select('*, prospects(business_name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch task', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const taskData: CreateTaskDto = req.body;
    const { data, error } = await supabase.from('tasks').insert(taskData).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    logger.error('Failed to create task', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateTaskDto = req.body;
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to update task', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const completeTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: task } = await supabase.from('tasks').select('*').eq('id', id).single();

    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity if task is linked to a prospect
    if (task && task.prospect_id) {
      await supabase.from('activities').insert({
        prospect_id: task.prospect_id,
        type: 'task_completed',
        title: `Task completed: ${task.title}`,
        metadata: { task_id: id },
      });
    }

    res.json(data);
  } catch (err) {
    logger.error('Failed to complete task', err);
    res.status(500).json({ error: 'Failed to complete task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    logger.error('Failed to delete task', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
