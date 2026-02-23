flowchart TD

A[Click Exportar Excel] --> B[Crear workbook ExcelJS]
B --> C[Insertar logo institucional]
C --> D[Insertar encabezado institucional]
D --> E[Leer tabla HTML]

E --> F[Excluir columna checkbox]
F --> G[Insertar filas con zebra]
G --> H[Aplicar autofiltro]
H --> I[Generar buffer]
I --> J[Descargar archivo XLSX]