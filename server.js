
import express from "express";

const servidor = express();

servidor.use(express.json());
servidor.set("json spaces", 2);

// INVENTARIO DE LA TIENDA DE VÍVERES

let inventario = [
    { codigo: 1, producto: "Arroz", costo: 4500, unidades: 100 },
    { codigo: 2, producto: "Lentejas", costo: 5200, unidades: 60 },
    { codigo: 3, producto: "Sardinas en lata", costo: 6500, unidades: 45 },
    { codigo: 4, producto: "Aceite vegetal", costo: 8500, unidades: 35 },
    { codigo: 5, producto: "Azúcar", costo: 4000, unidades: 80 },
    { codigo: 6, producto: "Fríjoles", costo: 5800, unidades: 55 },
    { codigo: 7, producto: "Pasta", costo: 3000, unidades: 90 },
    { codigo: 8, producto: "Sal", costo: 2000, unidades: 70 },
];

let contadorCodigo = 9;

// REGISTRO DE SOLICITUDES

servidor.use((req, res, next) => {
    const hora = new Date().toLocaleTimeString("es-CO");

    console.log(`${hora} -> ${req.method} ${req.originalUrl}`);

    next();
});

// VALIDAR NÚMEROS

const esNumeroValido = (valor) =>
    typeof valor === "number" &&
    !Number.isNaN(valor) &&
    valor >= 0;

// CONSULTAR TODOS LOS PRODUCTOS Y BUSCAR POR NOMBRE

servidor.get("/inventario", (req, res) => {
    const { buscar } = req.query;

    if (buscar) {
        const resultado = inventario.filter((item) =>
            item.producto.toLowerCase().includes(buscar.toLowerCase())
        );

        return res.status(200).json(resultado);
    }

    res.status(200).json(inventario);
});

// CONSULTAR UN PRODUCTO POR SU CÓDIGO

servidor.get("/inventario/:codigo", (req, res) => {
    const codigo = Number(req.params.codigo);

    const item = inventario.find((x) => x.codigo === codigo);

    if (!item) {
        return res.status(404).json({
            mensaje: "El producto no existe en el inventario"
        });
    }

    res.status(200).json(item);
});

// AGREGAR UN NUEVO PRODUCTO

servidor.post("/inventario", (req, res) => {
    const { producto, costo } = req.body;

    if (!producto || !esNumeroValido(costo)) {
        return res.status(400).json({
            mensaje: "Debes enviar 'producto' y un 'costo' numérico válido"
        });
    }

    const nuevoItem = {
        codigo: contadorCodigo++,
        producto,
        costo,
        unidades: 0
    };

    inventario.push(nuevoItem);

    res.status(201).json(nuevoItem);
});

// ACTUALIZAR COMPLETAMENTE UN PRODUCTO (PUT)

servidor.put("/inventario/:codigo", (req, res) => {
    const codigo = Number(req.params.codigo);

    const indice = inventario.findIndex((x) => x.codigo === codigo);

    if (indice === -1) {
        return res.status(404).json({
            mensaje: "El producto no existe en el inventario"
        });
    }

    const { producto, costo, unidades } = req.body;

    if (
        !producto ||
        !esNumeroValido(costo) ||
        !esNumeroValido(unidades)
    ) {
        return res.status(400).json({
            mensaje: "Se requieren 'producto', 'costo' y 'unidades' válidos"
        });
    }

    inventario[indice] = {
        codigo,
        producto,
        costo,
        unidades
    };

    res.status(200).json(inventario[indice]);
});

// ACTUALIZAR PARCIALMENTE UN PRODUCTO (PATCH)

servidor.patch("/inventario/:codigo", (req, res) => {
    const codigo = Number(req.params.codigo);

    const item = inventario.find((x) => x.codigo === codigo);

    if (!item) {
        return res.status(404).json({
            mensaje: "El producto no existe en el inventario"
        });
    }

    const { producto, costo, unidades } = req.body;

    if (producto !== undefined) {
        if (typeof producto !== "string" || !producto.trim()) {
            return res.status(400).json({
                mensaje: "El nombre del producto no es válido"
            });
        }
        item.producto = producto;
    }

    if (costo !== undefined) {
        if (!esNumeroValido(costo)) {
            return res.status(400).json({
                mensaje: "El costo debe ser un número válido"
            });
        }
        item.costo = costo;
    }

    if (unidades !== undefined) {
        if (!esNumeroValido(unidades)) {
            return res.status(400).json({
                mensaje: "Las unidades deben ser un número válido"
            });
        }
        item.unidades = unidades;
    }

    res.status(200).json(item);
});

// ELIMINAR UN PRODUCTO

servidor.delete("/inventario/:codigo", (req, res) => {
    const codigo = Number(req.params.codigo);

    const indice = inventario.findIndex((x) => x.codigo === codigo);

    if (indice === -1) {
        return res.status(404).json({
            mensaje: "El producto no existe en el inventario"
        });
    }

    inventario.splice(indice, 1);

    res.status(204).end();
});

// INICIAR SERVIDOR

servidor.listen(3003, () => {
    console.log(
        "API de tienda de víveres activa en http://localhost:3003"
    );
});
