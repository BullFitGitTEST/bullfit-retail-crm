import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { CreateCustomerDto, UpdateCustomerDto } from '../models/customer';
import logger from '../utils/logger';

export const getCustomers = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch customers', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch customer', err);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customerData: CreateCustomerDto = req.body;
    const { data, error } = await supabase.from('customers').insert(customerData).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    logger.error('Failed to create customer', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateCustomerDto = req.body;
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to update customer', err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('customers').delete().eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    logger.error('Failed to delete customer', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};
