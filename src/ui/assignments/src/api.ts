import { Order } from './types'
import { serverUrl } from './consts.ts'

function get(url: string) {
    console.log(`${serverUrl}/${url}`);
    return Promise.resolve();
}

function post(url: string) {
    console.log(`${serverUrl}/${url}`);
    return Promise.resolve();
}

export async function fetchTasks(): Promise<Order[]> {
    const tasks= await get('tasks');
    console.log(tasks);
    return [
        {
            id: '123',
            unit: 'תותחנים',
            region: 'צפון',
            subItems: [
                {

                    id: '11',
                    productId: '1',
                    productName: 'מגפיים',
                    quantity: 200,
                    requestedQuantity: 0,
                    status: 'assigned'
                },
                {
                    id: '22',
                    productId: '2',
                    productName: 'פגזים',
                    quantity: 200,
                    requestedQuantity: 0,
                   status: 'assigned'
                },
                {
                    id: '33',
                    productId: '3',
                    productName: 'חולצות',
                    quantity: 200,
                    requestedQuantity: 0,
                    status: 'assigned'
                }
            ]
        },
        {
            id: '1234',
            unit: 'תותחנים',
            region: 'צפון',
            subItems: [
                {

                    id: '11',
                    productId: '1',
                    productName: 'מגפיים',
                    quantity: 200,
                    requestedQuantity: 0,
                    status: 'assigned'
                },
                {
                    id: '22',
                    productId: '2',
                    productName: 'פגזים',
                    quantity: 200,
                    requestedQuantity: 0,
                   status: 'assigned'
                },
                {
                    id: '33',
                    productId: '3',
                    productName: 'חולצות',
                    quantity: 200,
                    requestedQuantity: 0,
                    status: 'assigned'
                }
            ]
        }
       ]
}

export function assignTask(id: string) {
    return post(id);
}