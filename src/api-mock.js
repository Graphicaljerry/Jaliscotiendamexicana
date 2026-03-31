/**
 * Mock API for browser preview (no Electron).
 * This lets the app render in any browser for demo/preview purposes.
 */

const CATEGORIES = [
  {id:1,name:'ARROZ',display_order:1,color:'#D97706'},
  {id:8,name:'BEBIDAS',display_order:2,color:'#2563EB'},
  {id:14,name:'BURRITO',display_order:3,color:'#16A34A'},
  {id:21,name:'CALDOS',display_order:4,color:'#DC2626'},
  {id:2,name:'COKTAILS',display_order:5,color:'#7C3AED'},
  {id:9,name:'DELI',display_order:6,color:'#0891B2'},
  {id:15,name:'DESAYUNOS',display_order:7,color:'#EA580C'},
  {id:22,name:'FLAUTAS',display_order:8,color:'#B91C1C'},
  {id:3,name:'FRIJOLES',display_order:9,color:'#92400E'},
  {id:10,name:'GORDITAS',display_order:10,color:'#9333EA'},
  {id:16,name:'GUACAMOLE',display_order:11,color:'#15803D'},
  {id:23,name:'GUIZADOS',display_order:12,color:'#C2410C'},
  {id:4,name:'MENUDO',display_order:13,color:'#BE123C'},
  {id:17,name:'PICO DE GALLO',display_order:14,color:'#E11D48'},
  {id:24,name:'POZOLE',display_order:15,color:'#A21CAF'},
  {id:5,name:'PRODUCE',display_order:16,color:'#059669'},
  {id:11,name:'PRODUCE A',display_order:17,color:'#047857'},
  {id:18,name:'QUESADILLA',display_order:18,color:'#CA8A04'},
  {id:25,name:'SALSA',display_order:19,color:'#DC2626'},
  {id:6,name:'SIDE ORDERS',display_order:20,color:'#0D9488'},
  {id:12,name:'SINCRNZDA',display_order:21,color:'#6D28D9'},
  {id:19,name:'SOPES',display_order:22,color:'#DB2777'},
  {id:26,name:'TACOS',display_order:23,color:'#2563EB'},
  {id:7,name:'TAMALES',display_order:24,color:'#B45309'},
  {id:13,name:'TOGO LLEVAR',display_order:25,color:'#4F46E5'},
  {id:20,name:'TORTAS',display_order:26,color:'#0F766E'},
  {id:27,name:'TOSTADAS',display_order:27,color:'#9F1239'},
];

const TACO_ITEMS = [
  {id:1,name:'TACOS Azada',price:1.99,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:1,category_id:26},
  {id:2,name:'TACOS BBQ',price:1.99,button_color:'#8BC34A',is_taxable:1,is_ebt_eligible:0,grid_position:2,category_id:26},
  {id:3,name:'Tacos Chorizo',price:1.99,button_color:'#2196F3',is_taxable:1,is_ebt_eligible:0,grid_position:3,category_id:26},
  {id:4,name:'TACOS DE HUEVO',price:1.99,button_color:'#F44336',is_taxable:1,is_ebt_eligible:0,grid_position:4,category_id:26},
  {id:5,name:'CON QUESO',price:1.00,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:5,category_id:26},
  {id:6,name:'Carne Extra',price:2.00,button_color:'#B71C1C',is_taxable:1,is_ebt_eligible:0,grid_position:6,category_id:26},
  {id:7,name:'Doble Tortilla',price:0.50,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:7,category_id:26},
  {id:8,name:'Tortillas Extras Unidad',price:0.25,button_color:'#9C27B0',is_taxable:1,is_ebt_eligible:0,grid_position:8,category_id:26},
  {id:9,name:'CON AGUACATE',price:1.50,button_color:'#B71C1C',is_taxable:1,is_ebt_eligible:0,grid_position:9,category_id:26},
  {id:10,name:'TACOS Carnitas',price:3.50,button_color:'#009688',is_taxable:1,is_ebt_eligible:0,grid_position:10,category_id:26},
  {id:11,name:'TACOS Lengua',price:4.00,button_color:'#009688',is_taxable:1,is_ebt_eligible:0,grid_position:11,category_id:26},
  {id:12,name:'Tacos Cabeza',price:3.50,button_color:'#9C27B0',is_taxable:1,is_ebt_eligible:0,grid_position:12,category_id:26},
  {id:13,name:'Taco Chicharron',price:3.00,button_color:'#757575',is_taxable:1,is_ebt_eligible:0,grid_position:13,category_id:26},
  {id:14,name:'ORDEN QUESO BIRRIA',price:5.00,button_color:'#FF9800',is_taxable:1,is_ebt_eligible:0,grid_position:14,category_id:26},
  {id:15,name:'TACOS Tripa',price:3.50,button_color:'#E91E63',is_taxable:1,is_ebt_eligible:0,grid_position:15,category_id:26},
  {id:16,name:'TACOS Pollo',price:3.00,button_color:'#FFEB3B',is_taxable:1,is_ebt_eligible:0,grid_position:16,category_id:26},
  {id:17,name:'Flauta por unidad',price:2.50,button_color:'#F44336',is_taxable:1,is_ebt_eligible:0,grid_position:17,category_id:26},
  {id:18,name:'Taco de Buche',price:3.50,button_color:'#757575',is_taxable:1,is_ebt_eligible:0,grid_position:18,category_id:26},
  {id:19,name:'Comida Deli',price:8.99,button_color:'#2196F3',is_taxable:1,is_ebt_eligible:0,grid_position:19,category_id:26},
  {id:20,name:'Crema extra 2oz',price:1.00,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:20,category_id:26},
  {id:21,name:'TACOS Camaron',price:4.50,button_color:'#FFEB3B',is_taxable:1,is_ebt_eligible:0,grid_position:21,category_id:26},
  {id:22,name:'TACOS Pastor',price:3.50,button_color:'#FFEB3B',is_taxable:1,is_ebt_eligible:0,grid_position:22,category_id:26},
  {id:23,name:'Tacos de Secina',price:3.50,button_color:'#F44336',is_taxable:1,is_ebt_eligible:0,grid_position:23,category_id:26},
  {id:24,name:'Tortilla de Harina',price:0.50,button_color:'#757575',is_taxable:1,is_ebt_eligible:0,grid_position:24,category_id:26},
  {id:25,name:'Taco Preprdo',price:3.50,button_color:'#FFEB3B',is_taxable:1,is_ebt_eligible:0,grid_position:25,category_id:26},
  {id:26,name:'Crema extra 4oz',price:1.50,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:26,category_id:26},
];

const SAMPLE_ITEMS_BY_CATEGORY = {
  1: [
    {id:101,name:'Arroz Blanco',price:3.00,button_color:'#FF9800',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:102,name:'Arroz Rojo',price:3.50,button_color:'#E53E3E',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:103,name:'Arroz con Pollo',price:8.99,button_color:'#D69E2E',is_taxable:1,is_ebt_eligible:0,grid_position:3},
    {id:104,name:'Arroz con Camarones',price:12.99,button_color:'#009688',is_taxable:1,is_ebt_eligible:0,grid_position:4},
  ],
  2: [
    {id:110,name:'Coctel de Camaron',price:14.99,button_color:'#E53E3E',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:111,name:'Coctel de Pulpo',price:15.99,button_color:'#9C27B0',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:112,name:'Coctel Mixto',price:16.99,button_color:'#FF9800',is_taxable:1,is_ebt_eligible:0,grid_position:3},
    {id:113,name:'Campechana',price:16.99,button_color:'#B71C1C',is_taxable:1,is_ebt_eligible:0,grid_position:4},
  ],
  3: [
    {id:120,name:'Frijoles Refritos',price:2.50,button_color:'#795548',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:121,name:'Frijoles de Olla',price:2.50,button_color:'#5D4037',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:122,name:'Frijoles Charros',price:3.99,button_color:'#E53E3E',is_taxable:1,is_ebt_eligible:0,grid_position:3},
  ],
  4: [
    {id:130,name:'Menudo Chico',price:8.99,button_color:'#F44336',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:131,name:'Menudo Grande',price:12.99,button_color:'#B71C1C',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:132,name:'Menudo Para Llevar (qt)',price:10.99,button_color:'#E91E63',is_taxable:1,is_ebt_eligible:0,grid_position:3},
  ],
  5: [
    {id:140,name:'Cebolla (lb)',price:0.99,button_color:'#8BC34A',is_taxable:0,is_ebt_eligible:1,grid_position:1},
    {id:141,name:'Tomate (lb)',price:1.49,button_color:'#F44336',is_taxable:0,is_ebt_eligible:1,grid_position:2},
    {id:142,name:'Cilantro',price:0.79,button_color:'#4CAF50',is_taxable:0,is_ebt_eligible:1,grid_position:3},
    {id:143,name:'Chile Serrano (lb)',price:1.99,button_color:'#2E7D32',is_taxable:0,is_ebt_eligible:1,grid_position:4},
    {id:144,name:'Limon (each)',price:0.25,button_color:'#CDDC39',is_taxable:0,is_ebt_eligible:1,grid_position:5},
    {id:145,name:'Aguacate (each)',price:1.50,button_color:'#33691E',is_taxable:0,is_ebt_eligible:1,grid_position:6},
  ],
  6: [
    {id:150,name:'Rice Side',price:2.00,button_color:'#FF9800',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:151,name:'Beans Side',price:2.00,button_color:'#795548',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:152,name:'Guac Side',price:3.00,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:3},
    {id:153,name:'Sour Cream Side',price:1.50,button_color:'#E0E0E0',is_taxable:1,is_ebt_eligible:0,grid_position:4},
    {id:154,name:'Chips & Salsa',price:3.99,button_color:'#FF5722',is_taxable:1,is_ebt_eligible:0,grid_position:5},
  ],
  7: [
    {id:160,name:'Tamal de Puerco',price:2.50,button_color:'#FF9800',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:161,name:'Tamal de Pollo',price:2.50,button_color:'#FFEB3B',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:162,name:'Tamal de Rajas',price:2.50,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:3},
    {id:163,name:'Tamal Dulce',price:2.00,button_color:'#E91E63',is_taxable:1,is_ebt_eligible:0,grid_position:4},
    {id:164,name:'Dozen Tamales',price:24.99,button_color:'#B71C1C',is_taxable:1,is_ebt_eligible:0,grid_position:5},
  ],
  8: [
    {id:201,name:'Agua Horchata',price:3.00,button_color:'#D69E2E',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:202,name:'Agua Jamaica',price:3.00,button_color:'#E53E3E',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:203,name:'Coca Cola',price:1.49,button_color:'#B71C1C',is_taxable:1,is_ebt_eligible:0,grid_position:3},
    {id:204,name:'Jarritos',price:2.00,button_color:'#FF9800',is_taxable:1,is_ebt_eligible:0,grid_position:4},
    {id:205,name:'Sprite',price:1.49,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:5},
    {id:206,name:'Agua Natural',price:1.00,button_color:'#2196F3',is_taxable:1,is_ebt_eligible:0,grid_position:6},
    {id:207,name:'Mexican Coke',price:2.50,button_color:'#880E4F',is_taxable:1,is_ebt_eligible:0,grid_position:7},
    {id:208,name:'Cafe',price:2.00,button_color:'#3E2723',is_taxable:1,is_ebt_eligible:0,grid_position:8},
    {id:209,name:'Atole',price:3.50,button_color:'#FFAB91',is_taxable:1,is_ebt_eligible:0,grid_position:9},
  ],
  9: [
    {id:210,name:'Comida Deli Plate',price:8.99,button_color:'#2196F3',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:211,name:'Chicharron (lb)',price:7.99,button_color:'#FF9800',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:212,name:'Carnitas (lb)',price:9.99,button_color:'#795548',is_taxable:1,is_ebt_eligible:0,grid_position:3},
    {id:213,name:'Barbacoa (lb)',price:12.99,button_color:'#B71C1C',is_taxable:1,is_ebt_eligible:0,grid_position:4},
  ],
  10: [
    {id:220,name:'Gordita Azada',price:4.99,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:221,name:'Gordita Chicharron',price:4.99,button_color:'#FF9800',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:222,name:'Gordita Rajas',price:4.99,button_color:'#F44336',is_taxable:1,is_ebt_eligible:0,grid_position:3},
    {id:223,name:'Gordita Frijol',price:3.99,button_color:'#795548',is_taxable:1,is_ebt_eligible:0,grid_position:4},
  ],
  14: [
    {id:301,name:'Burrito Azada',price:9.99,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:302,name:'Burrito Pollo',price:9.99,button_color:'#FFEB3B',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:303,name:'Burrito Carnitas',price:9.99,button_color:'#FF9800',is_taxable:1,is_ebt_eligible:0,grid_position:3},
    {id:304,name:'Burrito Pastor',price:9.99,button_color:'#E91E63',is_taxable:1,is_ebt_eligible:0,grid_position:4},
    {id:305,name:'Burrito Chorizo',price:9.99,button_color:'#B71C1C',is_taxable:1,is_ebt_eligible:0,grid_position:5},
    {id:306,name:'Super Burrito',price:12.99,button_color:'#9C27B0',is_taxable:1,is_ebt_eligible:0,grid_position:6},
  ],
  15: [
    {id:310,name:'Huevos Rancheros',price:8.99,button_color:'#F44336',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:311,name:'Huevos con Chorizo',price:8.99,button_color:'#FF9800',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:312,name:'Chilaquiles',price:8.99,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:3},
    {id:313,name:'Huevos a la Mexicana',price:8.99,button_color:'#FFEB3B',is_taxable:1,is_ebt_eligible:0,grid_position:4},
  ],
  18: [
    {id:320,name:'Quesadilla Queso',price:5.99,button_color:'#FFEB3B',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:321,name:'Quesadilla Azada',price:8.99,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:322,name:'Quesadilla Pollo',price:8.99,button_color:'#FF9800',is_taxable:1,is_ebt_eligible:0,grid_position:3},
    {id:323,name:'Quesadilla Pastor',price:8.99,button_color:'#E91E63',is_taxable:1,is_ebt_eligible:0,grid_position:4},
  ],
  19: [
    {id:330,name:'Sope Azada',price:4.50,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:331,name:'Sope Pollo',price:4.50,button_color:'#FFEB3B',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:332,name:'Sope Chorizo',price:4.50,button_color:'#F44336',is_taxable:1,is_ebt_eligible:0,grid_position:3},
    {id:333,name:'Sope Frijol',price:3.50,button_color:'#795548',is_taxable:1,is_ebt_eligible:0,grid_position:4},
  ],
  20: [
    {id:340,name:'Torta Azada',price:8.99,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:341,name:'Torta Milanesa',price:8.99,button_color:'#FF9800',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:342,name:'Torta Cubana',price:10.99,button_color:'#B71C1C',is_taxable:1,is_ebt_eligible:0,grid_position:3},
    {id:343,name:'Torta Pastor',price:8.99,button_color:'#E91E63',is_taxable:1,is_ebt_eligible:0,grid_position:4},
    {id:344,name:'Torta Hawaiana',price:9.99,button_color:'#FFEB3B',is_taxable:1,is_ebt_eligible:0,grid_position:5},
  ],
  21: [
    {id:350,name:'Caldo de Pollo',price:10.99,button_color:'#FFEB3B',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:351,name:'Caldo de Res',price:12.99,button_color:'#B71C1C',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:352,name:'Caldo de Camaron',price:14.99,button_color:'#E91E63',is_taxable:1,is_ebt_eligible:0,grid_position:3},
    {id:353,name:'Caldo Tlalpeno',price:10.99,button_color:'#FF9800',is_taxable:1,is_ebt_eligible:0,grid_position:4},
  ],
  25: [
    {id:360,name:'Salsa Verde (8oz)',price:2.00,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:361,name:'Salsa Roja (8oz)',price:2.00,button_color:'#F44336',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:362,name:'Salsa Habanero (8oz)',price:2.50,button_color:'#FF9800',is_taxable:1,is_ebt_eligible:0,grid_position:3},
  ],
  26: TACO_ITEMS,
  27: [
    {id:370,name:'Tostada Azada',price:4.50,button_color:'#4CAF50',is_taxable:1,is_ebt_eligible:0,grid_position:1},
    {id:371,name:'Tostada Pollo',price:4.50,button_color:'#FFEB3B',is_taxable:1,is_ebt_eligible:0,grid_position:2},
    {id:372,name:'Tostada Ceviche',price:5.99,button_color:'#2196F3',is_taxable:1,is_ebt_eligible:0,grid_position:3},
  ],
};

// Build a flat list of ALL items for search/lookup
const ALL_ITEMS = [];
Object.values(SAMPLE_ITEMS_BY_CATEGORY).forEach(items => {
  items.forEach(item => ALL_ITEMS.push(item));
});

// Add grocery/produce items with real store SKU codes
// S = sold by scale (per lb), Q = sold by quantity (each)
// Verified against store binder pages 1-5
const GROCERY_ITEMS = [
  // ─── PAGE 1: Aguacate → Chayote Espino ────────────────
  {id:500,barcode:'200',name:'Tomates Bola (lb)',price:1.29,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:501,barcode:'201',name:'Tomate Roma / Plum (lb)',price:1.29,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:502,barcode:'202',name:'Tomatillo Fresco (lb)',price:1.49,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:503,barcode:'203',name:'Jalapeno Fresco (lb)',price:1.49,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:504,barcode:'204',name:'Aguacate Mexicano Hass (each)',price:1.50,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:505,barcode:'207',name:'Nopal Sin Pelar (lb)',price:1.29,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:506,barcode:'208',name:'Nopal Pelado (lb)',price:1.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:507,barcode:'209',name:'Nopal Picado (lb)',price:2.49,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:508,barcode:'210',name:'Aguacate Dominicano (each)',price:1.99,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:509,barcode:'211',name:'Papas Blancas Suelta / Potato White (lb)',price:0.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:510,barcode:'212',name:'Papas Rojas Suelta / Potato Red (lb)',price:1.29,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:511,barcode:'213',name:'Cebolla Blanca / Onions White (lb)',price:0.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:512,barcode:'214',name:'Cebolla Amarilla Suelta / Onions Yellow (lb)',price:0.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:513,barcode:'215',name:'Cebolla Roja Suelta / Onions Red (lb)',price:1.29,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:514,barcode:'216',name:'Repollo / Cabbage (lb)',price:0.69,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:515,barcode:'217',name:'Pepinos / Cucumbers (each)',price:0.79,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:516,barcode:'218',name:'Calabasita / Green Squash (lb)',price:1.29,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:517,barcode:'219',name:'Chile Serrano Fresco (lb)',price:1.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:518,barcode:'220',name:'Chile Habanero (lb)',price:3.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:519,barcode:'221',name:'Chile Chilaca (lb)',price:3.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:520,barcode:'222',name:'Banana Verde (lb)',price:0.79,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:521,barcode:'223',name:'Banana Amarilla (lb)',price:0.69,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:522,barcode:'223B',name:'Batata / Camote (lb)',price:1.49,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:523,barcode:'224',name:'Manzana Roja / Apple Red (each)',price:0.99,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:524,barcode:'225',name:'Manzana Verde (each)',price:0.99,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:525,barcode:'226',name:'Mandarina (each)',price:0.50,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:526,barcode:'227',name:'Naranjas Grande (each)',price:0.79,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:527,barcode:'229',name:'Chile Poblano Fresco (lb)',price:1.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:528,barcode:'231',name:'Aullama / Calabaza (lb)',price:0.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:529,barcode:'232',name:'Cana / Cane (each)',price:1.99,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:530,barcode:'233',name:'Melon / Cantaloupe (each)',price:2.99,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:531,barcode:'234',name:'Zanahoria / Carrots Per Pound (lb)',price:0.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:532,barcode:'235',name:'Cebollin / Cambray / Scallions (bunch)',price:0.99,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:533,barcode:'236',name:'Celery (each)',price:1.49,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:534,barcode:'237',name:'Granada / Pomegranate (each)',price:1.99,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:535,barcode:'238',name:'Cilantro (bunch)',price:0.79,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:536,barcode:'240',name:'Jicama (lb)',price:1.29,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:537,barcode:'241',name:'Lechoza / Papaya (lb)',price:1.49,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},

  // ─── PAGE 2: Chile Ancho → Lechoza ────────────────────
  // (chiles, fruits, greens)
  {id:538,barcode:'243',name:'Lime / Limon Verde (each)',price:0.25,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:539,barcode:'244',name:'Maiz Mazorca / Elote (each)',price:0.79,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:540,barcode:'245',name:'Mango Bola (each)',price:1.29,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:541,barcode:'246',name:'Mango Mexicano (each)',price:1.29,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:542,barcode:'247',name:'Eggplant / Berenjena (lb)',price:1.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:543,barcode:'248',name:'Pepper Bell / Pimiento Verde (lb)',price:1.49,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:544,barcode:'249',name:'Pina / Pineapple (each)',price:3.99,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:545,barcode:'251',name:'Platano Verde (each)',price:0.50,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:546,barcode:'252',name:'Rabano / Radish (lb)',price:0.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:547,barcode:'253',name:'Watermelon / Sandia (each)',price:5.99,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:548,barcode:'254',name:'Tayota / Chayote (each)',price:1.29,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:549,barcode:'255',name:'Chayote Espino (lb)',price:1.49,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},

  // ─── PAGE 3: Lime → Peach ─────────────────────────────
  {id:550,barcode:'256',name:'Uvas Rojas / Grapes Red (lb)',price:2.49,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:551,barcode:'257',name:'Uva Verde / Grapes Green (lb)',price:2.49,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:552,barcode:'258',name:'Yuca (lb)',price:1.49,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:553,barcode:'259',name:'Durazno / Peach Nectarine (lb)',price:1.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:554,barcode:'260',name:'Pepper Red (lb)',price:1.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:555,barcode:'261',name:'Limon Amarillo (each)',price:0.50,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},

  // ─── PAGE 4: Pepinos → Tuna Fruta ─────────────────────
  {id:556,barcode:'262',name:'Chile Guajillo Seco (lb)',price:7.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:557,barcode:'263',name:'Tamarindo (lb)',price:2.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:558,barcode:'264',name:'Chile Morita Seco (lb)',price:6.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:559,barcode:'265',name:'Flor De Jamaica (lb)',price:5.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:560,barcode:'266',name:'Chile Arbol Seco (lb)',price:8.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:561,barcode:'267',name:'Chile Ancho Seco (lb)',price:7.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},

  // ─── PAGE 5: Uva Verde → Yautia ──────────────────────
  {id:562,barcode:'270',name:'Ginger / Jengibre (lb)',price:3.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:563,barcode:'271',name:'Epazote (lb)',price:1.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:564,barcode:'272',name:'Tuna Fruta (each)',price:0.99,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:565,barcode:'274',name:'Guayaba Fresca (lb)',price:2.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:566,barcode:'275',name:'Mamey (lb)',price:3.49,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:567,barcode:'276',name:'Plum / Ciruela (lb)',price:1.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:568,barcode:'277',name:'Pera / Pear (each)',price:0.99,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:569,barcode:'279',name:'Culantro (bunch)',price:1.49,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:570,barcode:'280',name:'Savila / Aloe Vera (each)',price:1.99,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},
  {id:571,barcode:'281',name:'Apricot (lb)',price:2.49,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:572,barcode:'283',name:'Yautia / Lila (lb)',price:1.99,is_taxable:0,is_ebt_eligible:1,sell_by:'S'},
  {id:573,barcode:'284',name:'Chinola (each)',price:1.49,is_taxable:0,is_ebt_eligible:1,sell_by:'Q'},

  // ─── GROCERY / PANTRY / DAIRY ─────────────────────────
  {id:600,barcode:'300',name:'Coca Cola Lata',price:1.49,is_taxable:1,is_ebt_eligible:0},
  {id:601,barcode:'301',name:'Jarritos Tamarindo',price:1.50,is_taxable:1,is_ebt_eligible:0},
  {id:602,barcode:'302',name:'Jarritos Mandarina',price:1.50,is_taxable:1,is_ebt_eligible:0},
  {id:603,barcode:'303',name:'Takis Fuego 280g',price:4.99,is_taxable:1,is_ebt_eligible:1},
  {id:604,barcode:'304',name:'Maseca Corn Flour 4.4lb',price:4.49,is_taxable:0,is_ebt_eligible:1},
  {id:605,barcode:'305',name:'Abuelita Chocolate 540g',price:5.99,is_taxable:0,is_ebt_eligible:1},
  {id:606,barcode:'306',name:'Crema Mexicana 16oz',price:3.99,is_taxable:0,is_ebt_eligible:1},
  {id:607,barcode:'307',name:'Queso Fresco',price:4.49,is_taxable:0,is_ebt_eligible:1},
  {id:608,barcode:'308',name:'Queso Oaxaca (lb)',price:5.99,is_taxable:0,is_ebt_eligible:1},
  {id:609,barcode:'309',name:'Frijol Pinto 2lb',price:3.49,is_taxable:0,is_ebt_eligible:1},
  {id:610,barcode:'310',name:'Arroz 2lb bag',price:2.49,is_taxable:0,is_ebt_eligible:1},
  {id:611,barcode:'311',name:'Tortillas Corn (30ct)',price:2.99,is_taxable:0,is_ebt_eligible:1},
  {id:612,barcode:'312',name:'Tortillas Flour (20ct)',price:3.49,is_taxable:0,is_ebt_eligible:1},
  {id:613,barcode:'313',name:'Pan Dulce (each)',price:1.25,is_taxable:0,is_ebt_eligible:1},
  {id:614,barcode:'314',name:'Leche Gallon',price:4.99,is_taxable:0,is_ebt_eligible:1},
  {id:615,barcode:'315',name:'Huevos Dozen',price:3.99,is_taxable:0,is_ebt_eligible:1},
];
GROCERY_ITEMS.forEach(item => ALL_ITEMS.push(item));

const CUSTOMERS = [
  {id:1,customer_number:'C001',name:'Maria Garcia',phone:'555-0101',email:'maria@email.com'},
  {id:2,customer_number:'C002',name:'Jose Rodriguez',phone:'555-0102',email:'jose@email.com'},
  {id:3,customer_number:'C003',name:'Ana Martinez',phone:'555-0103',email:'ana@email.com'},
];

export function installMockApi() {
  if (window.api) return;

  window.api = {
    getItems: () => Promise.resolve(ALL_ITEMS),
    getItemByBarcode: (barcode) => {
      return Promise.resolve(ALL_ITEMS.find(i => i.barcode === barcode) || null);
    },
    getItemById: (id) => Promise.resolve(ALL_ITEMS.find(i => i.id === id) || null),
    getItemsByCategory: (catId) => Promise.resolve(SAMPLE_ITEMS_BY_CATEGORY[catId] || []),
    searchItems: (q) => {
      const lower = q.toLowerCase();
      return Promise.resolve(ALL_ITEMS.filter(i =>
        i.name.toLowerCase().includes(lower) ||
        (i.barcode && i.barcode.includes(q))
      ).slice(0, 20));
    },
    createItem: (item) => Promise.resolve({ id: Date.now(), ...item }),
    updateItem: (id, item) => Promise.resolve({ id, ...item }),
    deleteItem: () => Promise.resolve({ success: true }),

    getCategories: () => Promise.resolve(CATEGORIES),
    createCategory: (c) => Promise.resolve({ id: Date.now(), ...c }),
    updateCategory: (id, c) => Promise.resolve({ id, ...c }),
    deleteCategory: () => Promise.resolve({ success: true }),

    searchCustomers: (query) => {
      const q = query.replace(/^[#@]/, '').toLowerCase();
      return Promise.resolve(CUSTOMERS.filter(c =>
        c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)) || (c.email && c.email.includes(q)) || (c.customer_number && c.customer_number.toLowerCase().includes(q))
      ));
    },
    getCustomerById: (id) => Promise.resolve(CUSTOMERS.find(c => c.id === id) || null),
    createCustomer: (c) => Promise.resolve({ id: Date.now(), ...c }),
    updateCustomer: (id, c) => Promise.resolve({ id, ...c }),

    createTransaction: (d) => Promise.resolve({ id: Date.now(), ...d }),
    getTransactions: () => Promise.resolve([]),
    getTransactionById: () => Promise.resolve(null),
    getDailySales: () => Promise.resolve({ date: new Date().toISOString().split('T')[0], summary: { transaction_count: 0, total_subtotal: 0, total_tax: 0, total_sales: 0, total_discounts: 0, total_ebt: 0 }, byPaymentType: [], transactions: [] }),

    getSetting: (key) => {
      const s = { tax_rate: '8.25', store_name: 'Jalisco Tienda Mexicana', admin_password: '1234', server_mode: 'primary' };
      return Promise.resolve(s[key] || null);
    },
    setSetting: () => Promise.resolve({ success: true }),
    getAllSettings: () => Promise.resolve({ tax_rate: '8.25', store_name: 'Jalisco Tienda Mexicana', admin_password: '1234', printer_type: 'epson', printer_interface: '', server_port: '3000', server_mode: 'primary', ebt_enabled: 'true' }),

    printReceipt: () => Promise.resolve({ success: true, message: 'Preview mode - no printer' }),
    openCashDrawer: () => Promise.resolve({ success: true }),
    testPrinter: () => Promise.resolve({ success: true, message: 'Preview mode - no printer connected' }),

    getNetworkStatus: () => Promise.resolve({ mode: 'primary', connected: true, ip: 'preview' }),
    setServerMode: () => Promise.resolve({ success: true }),
  };

  console.log('Mock API installed for browser preview');
}
