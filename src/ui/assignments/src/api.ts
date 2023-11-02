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
            items: [
                {
                    type: 'shoes',
                    amount: 200
                }
            ]
        },
        {
            id: '12345',
            items: [
                {
                    type: 'shoes',
                    amount: 300
                }
            ]
        }
    ]
}

export function assignTask(id) {
    return post(id);
}