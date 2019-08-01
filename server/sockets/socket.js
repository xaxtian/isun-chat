const { io } = require('../server');

const Usuarios = require('../clases/usuarios');
const { crearMensaje } = require('../utils/utilidades');

const usuarios = new Usuarios();


io.on('connection', (client) => {
    client.on('entrarChat', (usuario, callback) => {
        if (!usuario.nombre || !usuario.sala) {
            return callback({
                ok: false,
                mensaje: 'El nombre y la sala son obligatorios'
            });
        }
        client.join(usuario.sala);
        let personas = usuarios.addPerson(client.id, usuario.nombre, usuario.sala);

        client.broadcast.to(usuario.sala).emit('listaPersonas', usuarios.getPersonaPorSala(usuario.sala));

        callback(usuarios.getPersonaPorSala(usuario.sala));

    });

    client.on('crearMensaje', (data) => {
        console.log(data);
        let persona = usuarios.getPerson(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
    });

    client.on('disconnect', () => {
        let pesonaBorrada = usuarios.deletePerson(client.id);
        client.broadcast.to(pesonaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${pesonaBorrada.nombre} abandono el chat`));
        client.broadcast.to(pesonaBorrada.sala).emit('listaPersonas', usuarios.getPersonaPorSala(pesonaBorrada.sala));
    });

    client.on('mensajePrivado', (data) => {
        let persona = usuarios.getPerson(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
    })

    client.on('mensajeSala', (data) => {
        let persona = usuarios.getPerson(client.id);
        client.broadcast.to(persona.sala).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
    })
})