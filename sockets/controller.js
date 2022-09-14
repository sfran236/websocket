const TicketControl = require("../models/ticket-control");

const ticketControl = new TicketControl();

const socketController = (socket) =>{
    // console.log('Cliente conectado',socket.id);

    // socket.on('disconnect',()=>{
    //     console.log('Cliente desconectado',socket.id)
    // })
    socket.emit('ultimo-ticket', ticketControl.ultimo);
    socket.emit('estado-actual', ticketControl.ultimos4);
    socket.emit('tickets-pendientes', ticketControl.tickets.length);

    socket.on('siguiente-ticket',(payload,callback) =>{
        const siguiente = ticketControl.siguiente();
        callback(siguiente)

        //notificar que hay un nuevo ticket pendiente
        socket.broadcast.emit('tickets-pendientes',ticketControl.tickets.length);
    });

    socket.on('atender-ticket',({escritorio},callback)=>{
        if (!escritorio) {
            return callback({
                ok:false,
                msg: 'Es escritorio es obligatorio'
            });
           
        }
        const ticket = ticketControl.atenderTicket(escritorio);

        //notificar cambio en los ultimos cuatro

        socket.broadcast.emit('estado-actual',ticketControl.ultimos4);
        socket.emit('tickets-pendientes',ticketControl.tickets.length); // le actualiza al cliente
        socket.broadcast.emit('tickets-pendientes',ticketControl.tickets.length); // le actualiza a todos menos el cliente

        if (!ticket) {
            callback({
                ok: false,
                msg: 'Ya no hay tickets pendientes'
            })
        }else{
            callback({
                ok: true,
                ticket
            })
        }
    })
}

module.exports = {
    socketController
}