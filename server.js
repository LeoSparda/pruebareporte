const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

// Configuración de Supabase
const SUPABASE_URL = 'https://sxpkugpffzmmqdcogcat.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cGt1Z3BmZnptbXFkY29nY2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ3Nzk2MzksImV4cCI6MjA0MDM1NTYzOX0.6DRL4YWI-nzNTC1TaEhPQh2j4luhbOostzcyt_ecidI'; // Reemplaza con tu clave pública
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors()); // Habilita CORS

// Obtener tiendas
app.get('/api/tiendas', async (req, res) => {
    const { data, error } = await supabase
        .from('tiendas')
        .select('*');
    if (error) {
        console.error('Error al obtener tiendas:', error);
        res.status(500).send('Error al obtener tiendas');
    } else {
        res.json(data);
    }
});

// Obtener subtiendas de una tienda
app.get('/api/subtiendas/:tiendaId', async (req, res) => {
    const tiendaId = req.params.tiendaId;
    const { data, error } = await supabase
        .from('subtiendas')
        .select('*')
        .eq('tienda_id', tiendaId);
    if (error) {
        console.error('Error al obtener subtiendas:', error);
        res.status(500).send('Error al obtener subtiendas');
    } else {
        res.json(data);
    }
});

// Agregar tienda
app.post('/api/tiendas', async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).send('Nombre de la tienda es requerido');
    }
    const { data, error } = await supabase
        .from('tiendas')
        .insert([{ nombre }]);
    if (error) {
        console.error('Error al agregar tienda:', error);
        res.status(500).send('Error al agregar tienda');
    } else {
        res.status(201).json(data[0]);
    }
});

// Eliminar tienda
app.delete('/api/tiendas/:id', async (req, res) => {
    const id = req.params.id;
    const { error } = await supabase
        .from('tiendas')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error al eliminar la tienda:', error);
        res.status(500).send('Error al eliminar la tienda');
    } else {
        res.status(204).send();
    }
});

// Agregar subtienda
app.post('/api/subtiendas', async (req, res) => {
    const { tienda_id, nombre } = req.body;
    if (!tienda_id || !nombre) {
        return res.status(400).send('ID de tienda y nombre son requeridos');
    }
    const { data, error } = await supabase
        .from('subtiendas')
        .insert([{ tienda_id, nombre }]);
    if (error) {
        console.error('Error al agregar subtienda:', error);
        res.status(500).send('Error al agregar subtienda');
    } else {
        res.status(201).json(data[0]);
    }
});

// Eliminar subtienda
app.delete('/api/subtiendas/:id', async (req, res) => {
    const id = req.params.id;
    const { error } = await supabase
        .from('subtiendas')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error al eliminar la subtienda:', error);
        res.status(500).send('Error al eliminar la subtienda');
    } else {
        res.status(204).send();
    }
});

// Obtener inventario de una subtienda específica
app.get('/api/inventario/:subtiendaId', async (req, res) => {
    const subtiendaId = req.params.subtiendaId;
    const { data, error } = await supabase
        .from('inventario')
        .select('*')
        .eq('subtienda_id', subtiendaId);
    if (error) {
        console.error('Error al obtener el inventario:', error);
        res.status(500).send('Error al obtener el inventario');
    } else {
        res.json(data);
    }
});

// Crear reporte
app.post('/api/reportes', async (req, res) => {
    const { inventario_id, fecha, descripcion } = req.body;
    if (!inventario_id || !fecha || !descripcion) {
        return res.status(400).send('ID de inventario, fecha y descripción son requeridos');
    }
    const { data, error } = await supabase
        .from('reportes')
        .insert([{ inventario_id, fecha, descripcion }]);
    if (error) {
        console.error('Error al crear reporte:', error);
        res.status(500).send('Error al crear reporte');
    } else {
        res.status(201).json(data[0]);
    }
});

// Obtener todos los inventarios
app.get('/api/todos-inventarios', async (req, res) => {
    const { data, error } = await supabase
        .from('inventario')
        .select('*');
    if (error) {
        console.error('Error al obtener inventarios:', error);
        res.status(500).send('Error al obtener inventarios');
    } else {
        res.json(data);
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
