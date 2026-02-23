import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { CreateOrderDto, UpdateOrderDto } from '../models/order';
import logger from '../utils/logger';

export const getOrders = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch orders', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch order', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const getOrdersByCustomer = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch customer orders', err);
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const orderData: CreateOrderDto = req.body;
    const total = orderData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        total,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    logger.error('Failed to create order', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateOrderDto = req.body;
    const { data, error } = await supabase
      .from('orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to update order', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
};
