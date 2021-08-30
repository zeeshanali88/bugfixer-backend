const Router = require('koa-router');
const uuid = require('uuid').v4;

const ordersRouter = new Router({ prefix: '/orders' });
const ordersData = require('../lib/orders');

ordersRouter.post('/', async ctx => {
    const { customerName, items } = ctx.request.body;

    if (!items.length) {
        ctx.throw(409, 'No items ordered')
    }
    
    const total = items.reduce((orderTotal, item) => orderTotal += (item.price * item.quantity), 0)
    const order = {
        id: uuid(),
        customerName,
        createdOn: new Date(),
        items,
        total
    }

    ctx.status = 201;
    ctx.body = [ order ];
});

ordersRouter.get('/', async ctx => {
    
    const { filterProperty, filterValue } = ctx.query;
    let results = ordersData;

    if (filterProperty && filterValue) {
        let newOrdersData = []
        ordersData.forEach(orderData => {
            let filteredValues = orderData.items.filter(item => item[filterProperty].includes(filterValue))
            if(filteredValues.length) {
                newOrdersData.push({
                    ...orderData,
                    items: filteredValues
                })
            }
        })
        results = newOrdersData;
    }

    ctx.status = 200;
    ctx.body = results;
});

ordersRouter.get('/:id', async ctx => {
    const { id } = ctx.params;
    const order = ordersData.find(order => order.id === id)

    if (!order) {
        ctx.throw(404, 'Order not found')
    }

    ctx.status = 200;
    ctx.body = order;
});

ordersRouter.put('/:id', async ctx => {
    const { id } = ctx.params;
    const { customerName, items } = ctx.request.body;

    const order = ordersData.find(order => order.id === id);

    if(!order) {
        ctx.throw(404, 'Could not find order');
    }

    const updated = {
        ...order,
        customerName: customerName ? customerName : order.customerName,
        items: items ? items : order.items,
        price: items ? items.reduce((priceTotal, item) => priceTotal += (item.price * item.quantity), 0) : order.price
    }

    ctx.status = 200;
    ctx.body = updated;
});

ordersRouter.delete('/:id', async ctx => {
    const { id } = ctx.params;

    const order = ordersData.find(order => order.id === id);

    if(!order) {
        ctx.throw(404, 'Could not find order');
    }

    // const latest = ordersData.reduce((a, b) => (a.createdOn > b.createdOn ? a : b));
    const remaining = ordersData.filter(({ id }) => id !== order.id);

    ctx.status = 200;
    ctx.body = remaining;
});

module.exports = ordersRouter;
