import { Order } from './types'
import { serverUrl } from './consts.ts'
import orders from './orders.json'

function get(url: string) {
    console.log(`${serverUrl}/${url}`);
    return Promise.resolve();
}

function post(url: string) {
    console.log(`${serverUrl}/${url}`);
    return Promise.resolve();
}

export async function fetchAssignedOrders(): Promise<Order[]> {
    const tasks= await get('assigned-orders');
    console.log(tasks);
    return orders;
}

export async function fetchOrders(): Promise<Order[]> {
    const tasks= await get('orders');
    console.log(tasks);
    return orders;
}

export function assignTask(id: string) {
    return post(id);
}