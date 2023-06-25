let ruta = './';

const products = [];

let stockProducts = [];

// Routing
const routes = {
  '/': homeController,
  '/:modelo': productoController,
};

function homeController() {
  console.log("homeController");
  listProducts();
}

function productoController(params) {
  console.log("productController");
  const modelo = params.modelo;

  detail(modelo);
  //$('#home').html(`Renderizando el producto con modelo ${modelo}`);
}

async function detail(modelo) {
  let arr = modelo.split('-');
  const id = arr[0];
  console.log(arr);
  await getStockAndPrice(id);
  console.log("stockAndPrice", stockProducts);
  displayDetail(id);
  setTimeout(() => {
    detail(modelo);
  }, 5000); // Ejecuta la función detail nuevamente después de 5 segundos
}

async function getStockAndPrice(pid) {
  const URLJSON = ruta + `api/stockprice/${pid}`;
  try {
    const respuesta = await fetch(URLJSON);
    const data = await respuesta.json();
    console.log("data de stock", data);

    stockProducts = data;
    console.log("stockProducts1", stockProducts);
    console.log("price", stockProducts.stock_price[0].price);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
  }
}

function displayDetail(pid) {
  const main = $('#home');
  const marca = products.find(el => el.id == pid).marca;
  const modelo = products.find(el => el.id == pid).modelo;
  console.log("marca", marca);
  console.log("modelo", modelo);

  main.empty(); 

  const headerDiv = $('<div class="header"></div>');
  const backDiv = $('<div class="menu-icon"></div>');
  const img = $('<img src="./images/back.png">');
  backDiv.append(img);
  const dotsDiv = $('<div class="menu-icon"></div>');
  const dots = $('<img src="./images/dots.png">');
  dotsDiv.append(dots);
  const detailP = $('<p>Detail</p>');
  const a = $('<a href="/" class="a"></a>');
  a.click(handleLinkClick);
  a.append(backDiv);

  headerDiv.append(a);
  headerDiv.append(detailP);
  headerDiv.append(dotsDiv);
  main.append(headerDiv);

  const detail = $('<div class="detail"></div>');
  const image = $('<img>');
  image.attr('src', `./images/${marca} ${modelo}-img.png`);
  detail.append(image);
  main.append(detail);
  main.html(main.html() +
    `<div class="header">
      <p class="model">${marca} ${modelo}</p>
      <p class="price">$${stockProducts.stock_price[0].price/100}</p>
    </div>
    <div class="header">
      <p class="data">Origin: Import  Stock: ${stockProducts.stock_price[0].stock}</p>
    </div>
    <div class="header desc-title">
      <p>Description</p>
    </div>
    <div class="description">
      <p>Selling imported beer in the US with nearly 60 million cases in annual sales,
        growing more than 15 million cases over the past 2 years. A fully
      </p>
    </div>
    <div class="header">
      <p>Size</p>
    </div>`);
  const sizesDiv = $('<div class="header"></div>');
  for (const stockPrice of stockProducts.stock_price) {
    const sizeButton = $(`<button>${stockPrice.size}</button>`);
    sizesDiv.append(sizeButton);
  }
  main.append(sizesDiv);
  main.html(main.html() +
    `<div class="buttons">
      <div class="bag">
          <img src="./images/bag.png" alt="">
      </div>
      <button class="add"> Add to cart</button>
    </div>`);
}

function handleRouteChange() {
  console.log("handle route change");
  const path = window.location.pathname;
  console.log(path);
  let matchedRoute = null;

  for (const route in routes) {
    const routePattern = new RegExp(`^${route.replace(/:\w+/g, '([^/]+)')}$`);

    if (routePattern.test(path)) {
      matchedRoute = route;
      break;
    }
  }

  if (matchedRoute) {
    const params = extractParamsFromRoute(path, matchedRoute);
    routes[matchedRoute](params);
  } else {
    $('#products').html('Ruta no encontrada');
  }
}

function extractParamsFromRoute(path, route) {
  const paramNames = route.match(/:(\w+)/g) || [];
  const paramValues = path.match(new RegExp(`^${route.replace(/:\w+/g, '(.+)')}`)) || [];
  return paramNames.reduce((params, paramName, index) => {
    const key = paramName.slice(1);
    const value = paramValues[index + 1];
    params[key] = value;
    return params;
  }, {});
}

$(window).on('DOMContentLoaded', handleRouteChange);
$(window).on('popstate', handleRouteChange);
//$(window).on('load', handleRouteChange);

function obtenerProductosJson() {
  const URLJSON = ruta + 'products.mock.json';
  fetch(URLJSON)
    .then((respuesta) => respuesta.json())
    .then((data) => {
      console.log("data", data);
      for (const producto of data.productos) {
        products.push(producto);
      }
      listProducts(products);
    })
    .catch((error) => {
      console.error('Error al obtener los productos:', error);
    });
}

function handleLinkClick(event) {
  console.log("handleClick", event.target);
  event.preventDefault(); 

  const href = $(this).attr('href');
  console.log("href", href);
  history.pushState({}, '', href); 
  handleRouteChange(); 
}

obtenerProductosJson();

function listProducts(products) {
  let container = $('#products');
  container.html('');
  let product;
  for (const producto of products) {
    let a = $('<a>').attr('href', `/${producto.id}-${producto.marca}${producto.modelo}`);
    a.addClass('a');
    a.on('click', handleLinkClick);
    let div = $('<div>').addClass('card');
    let title = $('<p>').text(`${producto.marca} ${producto.modelo}`);
    title.addClass('card-title');
    let img = $('<img>').attr('src', `./images/${producto.marca} ${producto.modelo}-img.png`);
    let cardFooter = $('<div>').addClass('cardFooter');
    let price = $('<p>').text(producto.precio / 100);
    let add = $('<div>').html('+');
    div.append(title);
    div.append(img);
    cardFooter.append(price);
    cardFooter.append(add);

    div.append(cardFooter);
    a.append(div);
    container.append(a);
  }
}
