import { Task } from './types'
import { serverUrl } from './consts.ts'

function get(url) {
    console.log(`${serverUrl}/${url}`);
    return Promise.resolve();
}

function post(url) {
    console.log(`${serverUrl}/${url}`);
    return Promise.resolve();
}

export async function fetchTasks(): Promise<Task[]> {
    const tasks= await get('tasks');
    console.log(tasks);
    return [
        {
            id: '123',
            unit: 'תותחנים',
            products: [
                {

                    id: '11',
                    type: 'מגפיים',
                    amount: 200,
                    requestedAmount: 0
                },
                {
                    id: '22',
                    type: 'פגזים',
                    amount: 200,
                    requestedAmount: 0
                },
                {
                    id: '33',
                    type: 'חולצות',
                    amount: 200,
                    requestedAmount: 0
                }
            ]
        },
        {
            id: '12345',
            unit: 'שלדג',
            products: [
                {
                    id: '3',
                    type: 'וסטים',
                    amount: 300,
                    requestedAmount: 0
                },
                {
                    id: '777',
                    type: 'טונה',
                    amount: 10,
                    requestedAmount: 0
                }
            ]
        }
    ]
}

export function assignTask(id) {
    return post(id);
}