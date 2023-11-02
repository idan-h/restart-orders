import {assignTask, fetchTasks} from "./api.ts";
import {useEffect, useState} from "react";
import {Task} from "./types.ts";

export const Catalog = () => {
    const [items, setItems] = useState<Task[] | undefined>()

    const handleAssign = (id) => {
        assignTask(id);
    }

    useEffect(() => {
        fetchTasks().then(items => {
            debugger;
            setItems(items);
        })
    }, []);

    if (!items) {
        return  'Loading...';
    }

    return <div>
        <h3>Tasks :</h3>
        <ul>
            {items.map(({ id, items  }) =>
                <li>
                    Id: {id}
                    <div>
                        <ul>
                            {items.map(({ type, amount }) =>
                                <li>
                                    Type: {type}
                                    amount: {amount}
                                    <button onClick={() => handleAssign(id)}></button>
                                </li>
                            )}
                        </ul>
                    </div>
                </li>
            )}
        </ul>
    </div>
}