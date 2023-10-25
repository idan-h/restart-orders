export const fixCorruptResponse = (response, availableItems) => {
    response.subitems = response.subitems.map((subItem) => {
        if (subItem.name !== 'Incoming form answer') return subItem;
        return {
            ...subItem,
            name: availableItems.find((item) => {
                return item.product_number === subItem.product_number
            })?.name || ''
        }
    })
}