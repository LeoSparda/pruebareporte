const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Cambia esto según tu configuración
    password: '', // Cambia esto según tu configuración
    database: 'Tiendasgasfar',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1);
    }
    console.log('Conectado a la base de datos MySQL');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors()); // Habilita CORS

// Obtener tiendas
app.get('/api/tiendas', (req, res) => {
    const sql = 'SELECT * FROM tiendas';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener tiendas:', err);
            res.status(500).send('Error al obtener tiendas');
        } else {
            res.json(results);
        }
    });
});

// Obtener subtiendas de una tienda
app.get('/api/subtiendas/:tiendaId', (req, res) => {
    const tiendaId = req.params.tiendaId;
    const sql = 'SELECT * FROM subtiendas WHERE tienda_id = ?';
    db.query(sql, [tiendaId], (err, results) => {
        if (err) {
            console.error('Error al obtener subtiendas:', err);
            res.status(500).send('Error al obtener subtiendas');
        } else {
            res.json(results);
        }
    });
});

// Agregar tienda
app.post('/api/tiendas', (req, res) => {
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).send('Nombre de la tienda es requerido');
    }
    const sql = 'INSERT INTO tiendas (nombre) VALUES (?)';
    db.query(sql, [nombre], (err, results) => {
        if (err) {
            console.error('Error al agregar tienda:', err);
            res.status(500).send('Error al agregar tienda');
        } else {
            res.status(201).json({ id: results.insertId, nombre });
        }
    });
});

// Eliminar tienda
app.delete('/api/tiendas/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM tiendas WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar la tienda:', err);
            res.status(500).send('Error al eliminar la tienda');
        } else if (results.affectedRows === 0) {
            res.status(404).send('Tienda no encontrada');
        } else {
            res.status(204).send();
        }
    });
});

// Agregar subtienda
app.post('/api/subtiendas', (req, res) => {
    const { tienda_id, nombre } = req.body;
    if (!tienda_id || !nombre) {
        return res.status(400).send('ID de tienda y nombre son requeridos');
    }
    const sql = 'INSERT INTO subtiendas (tienda_id, nombre) VALUES (?, ?)';
    db.query(sql, [tienda_id, nombre], (err, results) => {
        if (err) {
            console.error('Error al agregar subtienda:', err);
            res.status(500).send('Error al agregar subtienda');
        } else {
            res.status(201).json({ id: results.insertId, nombre, tienda_id });
        }
    });
});

// Eliminar subtienda
app.delete('/api/subtiendas/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM subtiendas WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar la subtienda:', err);
            res.status(500).send('Error al eliminar la subtienda');
        } else if (results.affectedRows === 0) {
            res.status(404).send('Subtienda no encontrada');
        } else {
            res.status(204).send();
        }
    });
});

// Obtener inventario de una subtienda específica
app.get('/api/inventario/:subtiendaId', (req, res) => {
    const subtiendaId = req.params.subtiendaId;
    const sql = 'SELECT * FROM inventario WHERE subtienda_id = ?';
    db.query(sql, [subtiendaId], (err, results) => {
        if (err) {
            console.error('Error al obtener el inventario:', err);
            res.status(500).send('Error al obtener el inventario');
        } else if (results.length === 0) {
            res.status(404).send('Inventario no encontrado');
        } else {
            res.json(results);  
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Crear reporte
app.post('/api/reportes', (req, res) => {
    const { inventario_id, fecha, descripcion } = req.body;
    if (!inventario_id || !fecha || !descripcion) {
        return res.status(400).send('ID de inventario, fecha y descripción son requeridos');
    }
    const sql = 'INSERT INTO reportes (inventario_id, fecha, descripcion) VALUES (?, ?, ?)';
    db.query(sql, [inventario_id, fecha, descripcion], (err, results) => {
        if (err) {
            console.error('Error al crear reporte:', err);
            res.status(500).send('Error al crear reporte');
        } else {
            res.status(201).json({ id: results.insertId, inventario_id, fecha, descripcion });
        }
    });
});
// Obtener todos los inventarios
app.get('/api/todos-inventarios', (req, res) => {
    const sql = 'SELECT * FROM inventario';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener inventarios:', err);
            res.status(500).send('Error al obtener inventarios');
        } else {
            res.json(results);
        }
    });
});
