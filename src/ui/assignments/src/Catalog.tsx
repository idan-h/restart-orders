import {
    makeStyles,
    Body1,
    Caption1,
    Button,
    shorthands,
} from "@fluentui/react-components";
import {
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
} from "@fluentui/react-components";
import {assignTask, fetchTasks} from "./api.ts";
import {useEffect, useState} from "react";
import {Task} from "./types.ts";
import {Products} from "./products.tsx";

const resolveAsset = (asset: string) => {
    const ASSET_URL =
        "https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-card/stories/assets/";

    return `${ASSET_URL}${asset}`;
};

const useStyles = makeStyles({
    card: {
        ...shorthands.margin("auto"),
        textAlign: 'left',
        width: "720px",
        maxWidth: "100%",
        marginBottom: "30px"
    },
});

export const Catalog = () => {
    const styles = useStyles();

    const [items, setItems] = useState<Task[] | undefined>()

    const handleAssign = (id) => {
        assignTask(id);
    }

    useEffect(() => {
        fetchTasks().then(items => setItems(items))
    }, []);

    if (!items) {
        return  'Loading...';
    }

    return (
        <div style={{ textAlign: 'left' }}>
            {items.map(({ products }) => {
                return <Card className={styles.card}>
                    <CardHeader
                        image={
                            <img
                                src={resolveAsset("avatar_elvia.svg")}
                                alt="Elvia Atkins avatar picture"
                            />
                        }
                        header={
                            <Body1>
                                <b>Elvia Atkins</b> mentioned you
                            </Body1>
                        }
                        description={<Caption1>5h ago · About us - Overview</Caption1>}
                    />

                    <CardPreview>
                        Products:
                        <Products/>
                        {products.map(({type }) => {
                          return <div>{type}</div>
                      })}
                    </CardPreview>

                    <CardFooter>
                        <Button onClick={handleAssign}>Assign</Button>
                    </CardFooter>
                </Card>
            })}
        </div>
    );
};