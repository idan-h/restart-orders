import {
    makeStyles,
    Body1,
    Button,
    shorthands,
} from "@fluentui/react-components";
import {
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
} from "@fluentui/react-components";
import {assignTask, fetchTasks} from "../../api.ts";
import {useEffect, useState} from "react";
import {Task} from "../../types.ts";
import {Products} from "./Products.tsx";


const useStyles = makeStyles({
    card: {
        ...shorthands.margin("auto"),
        textAlign: 'left',
        width: "100%",
        marginBottom: "30px"
    },
});

export const Catalog = () => {
    const styles = useStyles();

    const [tasks, setTasks] = useState<Task[] | undefined>()

    const handleAssign = (id) => {
        assignTask(id);
    }

    const handleProductsChange = (id, products)=> {
        setTasks(tasks => (tasks || []).map(task => task.id === id ? {
            ...task,
            products
        } : task));
    }

    useEffect(() => {
        fetchTasks().then(items => setTasks(items))
    }, []);

    if (!tasks) {
        return  'Loading...';
    }

    return (
        <div style={{ margin: 'auto' }}>
            <h2 style={{ textAlign: 'center', margin: '20px auto' }}>בקשות</h2>
            {tasks.map(({ id, unit, products }) => {
                return <Card key={id} className={styles.card}>
                    <CardHeader
                        header={
                            <Body1 style={{ textAlign: 'left' }}>
                                <b>{unit}</b>
                            </Body1>
                        }
                    />

                    <CardPreview>
                        <Products onChange={(products) => handleProductsChange(id, products)} items={products}/>
                    </CardPreview>

                    <CardFooter>
                        <Button onClick={() => handleAssign(id)}>Assign</Button>
                    </CardFooter>
                </Card>
            })}
        </div>
    );
};