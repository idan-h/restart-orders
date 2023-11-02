import {
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableCellLayout, Switch, Input
} from "@fluentui/react-components";
import {Product} from "../../types.ts";

type Props = {
    items: Product[],
    onChange: (products: Product[]) => void
}

export const Products = ({ items, onChange }: Props) => {
    const handleProductToggle = (id: string, checked: boolean) => {
        onChange(items.map(item => id === item.id ? ({
            ...item,
            requestedAmount: checked ? item.amount : 0
       }): item));
    }

    const handleProductChange = (id: string, value: number) => {
        onChange(items.map(item => id === item.id ? ({
            ...item,
            requestedAmount: value
        }): item));
    }

    console.log(items)

    return (
        <Table arial-label="Default table">
            <TableBody>
                {items.map(({ id, type, amount, requestedAmount }) => (
                    <TableRow key={type}>
                        <TableCell>
                            <TableCellLayout>
                                {type}
                            </TableCellLayout>
                        </TableCell>
                        <TableCell>
                            <TableCellLayout>
                                {amount}
                            </TableCellLayout>
                        </TableCell>
                        <TableCell>
                            <Input style={{ width: '80px' }} min={1} max={amount} onChange={(_, data) =>  handleProductChange(id, data.value)} value={requestedAmount.toString()} type="number"
                                   disabled={!requestedAmount} />
                        </TableCell>
                        <TableCell>
                            <TableCellLayout>
                                <Switch onChange={(_, data) => handleProductToggle(id, data.checked)} />
                            </TableCellLayout>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}