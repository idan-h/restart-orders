import {useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";

export const useSuppliersFormData = (updateForm, reset, setSelectedItems) => {
    const [sectors, setSectors] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorType, setErrorType] = useState('');
    const [disabledItems, setDisabledItems] = useState([]);

    const { id } = useParams();

    useEffect(() => {
        try {
            const fetchSectors =
                fetch('https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/get_suppliers_sectors')
                    .then(res => res.json());
            const fetchItems =
                fetch(`https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/get-products`)
                    .then(res => res.json());
            const fetchOrder =
                updateForm && id ?
                    fetch(
                        'https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/get_supplier?id=' +
                        id
                    ).then(res => res.json()) :
                    new Promise(resolve => resolve(false));
            Promise.all([fetchSectors, fetchItems, fetchOrder]).then(([sectors, items, order]) => {
                if ('error' in sectors || 'error' in items) {
                    setErrorType('error');
                    return;
                }
                if (order && 'error' in order) {
                    setErrorType('error');
                    return;
                }
                if (order && order.is_cancel) {
                    setErrorType('cancel');
                    return;
                }
                setLoading(false);
                setErrorType('');
                setSectors(sectors.map(({name}) => ({value: name, label: name})));
                setItems(items);
                if (order) {
                    reset({
                        supplier_name: order.supplier_name,
                        contact_name: order.contact_name,
                        phone: order.phone,
                        location: order.location,
                        sector: order.sector,
                    })
                    setSelectedItems(order.subitems.map((subitem) => ({
                        name: subitem.name,
                        note: subitem.note,
                        product_number: subitem.product_number,
                        quantity: subitem.inventory,
                    })));
                    setDisabledItems(order.subitems.map((subitem) => subitem.product_number))
                }
            })
        } catch(err) {
            setLoading(false);

            console.error(`There was an error fetching the data: ${err}`);
            setErrorType('error');
        }

    }, [])

    const _items = useMemo(() => {
        return items.filter((item) => !disabledItems.includes(item.product_number));
    }, [items, disabledItems]);

    return { sectors, items: _items, loading, errorType, setItems, setLoading };
}