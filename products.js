let ruta = "./";

const products = [];

let stockProducts = [];

let selectedPrice = 0;

// Routing
const routes = {
  "/": homeController,
  "/:modelo": productoController,
};

function homeController() {
  console.log("homeController");
  listProducts();
}

function productoController(params) {
  console.log("productController");
  const modelo = params.modelo;

  detail(modelo);
  //document.getElementById('home').innerHTML = `Renderizando el producto con modelo ${modelo}`;
}

async function detail(modelo) {
  let arr = modelo.split("-");
  const id = arr[0];
  console.log(arr);
  await getStockAndPrice(id);
  console.log("stockAndPrice", stockProducts);

  displayDetail(id);
  setTimeout(() => {
    detail(modelo);
  }, 50000); // Ejecuta la función detail nuevamente después de 5 segundos
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
    console.error("Error al obtener los productos:", error);
  }
}

function displayDetail(pid) {
  console.log(stockProducts);
  const main = $("#home");
  const marca = products.find((el) => el.id == pid).marca;
  const modelo = products.find((el) => el.id == pid).modelo;
  console.log("marca", marca);
  console.log("modelo", modelo);

  main.empty(); // Limpia el contenido actual de main

  const headerDiv = $("<div>").addClass("header");
  const backDiv = $("<div>").addClass("menu-icon");
  const img = $("<img>").attr("src", "./images/back.png");
  backDiv.append(img);
  const dotsDiv = $("<div>").addClass("menu-icon");
  const dots = $("<img>").attr("src", "./images/dots.png");
  dotsDiv.append(dots);
  const detailP = $("<p>").text("Detail");
  let a = $("<a>")
    .attr("href", "/")
    .addClass("a")
    .on("click", handleLinkClick);
  a.append(backDiv);

  headerDiv.append(a);
  headerDiv.append(detailP);
  headerDiv.append(dotsDiv);
  main.append(headerDiv);

  const detail = $("<div>").addClass("detail");
  const image = $("<img>").attr("src", `./images/${marca} ${modelo}-img.png`);
  detail.append(image);
  main.append(detail);
  main.html(
    main.html() +
      `<div class="header">
      <p class="model">${marca} ${modelo}</p>
      <p class="price">$${
        stockProducts.stock_price[selectedPrice].price / 100
      }</p>
    </div>
    <div class="header">
      <p class="data">Origin: Import  Stock: ${
        stockProducts.stock_price[selectedPrice].stock
      }</p>
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
    </div>`
  );
  const sizesDiv = $("<div>").addClass("header");
  index = 0;
  for (const stockPrice of stockProducts.stock_price) {
    const sizeButton = $("<button>")
      .text(`${stockPrice.size}`)
      .attr("id", index)
      .attr("type", "button")
      .on("click", function (event) {
        handleChangeVariation(event, pid);
      });
    if (selectedPrice == index) {
      sizeButton.addClass("selected_size");
    } else {
      sizeButton.addClass("no_selected_size");
    }
    sizesDiv.append(sizeButton);
    index++;
  }
  main.append(sizesDiv);
  const buttonsDiv = $("<div>").addClass("buttons");
  const bagDiv = $("<div>").addClass("bag");
  const bagImage = $("<img>").attr("src", "./images/bag.png");
  bagDiv.append(bagImage);
  buttonsDiv.append(bagDiv);
  const addButton = $("<button>")
    .addClass("add")
    .text("Add to cart");
  buttonsDiv.append(addButton);
  main.append(buttonsDiv);
}

function handleChangeVariation(e, pid) {
  e.preventDefault();

  selectedPrice = e.target.id;
  displayDetail(pid);
}

function handleRouteChange() {
  console.log("handle route change");
  const path = window.location.pathname;
  console.log(path);
  let matchedRoute = null;

  for (const route in routes) {
    //const routePattern = new RegExp(`^${route.replace(/:\w+/g, '(.+)')}$`);
    const routePattern = new RegExp(`^${route.replace(/:\w+/g, "([^/]+)")}$`);

    if (routePattern.test(path)) {
      matchedRoute = route;
      break;
    }
  }

  if (matchedRoute) {
    const params = extractParamsFromRoute(path, matchedRoute);
    routes[matchedRoute](params);
  } else {
    $("#products").html("Ruta no encontrada");
  }
}

function extractParamsFromRoute(path, route) {
  const paramNames = route.match(/:(\w+)/g) || [];
  const paramValues =
    path.match(new RegExp(`^${route.replace(/:\w+/g, "(.+)")}`)) || [];
  return paramNames.reduce((params, paramName, index) => {
    const key = paramName.slice(1);
    const value = paramValues[index + 1];
    params[key] = value;
    return params;
  }, {});
}

$(document).ready(function () {
  handleRouteChange();
  window.addEventListener("popstate", handleRouteChange);
  //window.onload(handleRouteChange)
});

function obtenerProductosJson() {
  const URLJSON = ruta + "products.mock.json";
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
      console.error("Error al obtener los productos:", error);
    });
}

function handleLinkClick(event) {
  console.log("handleClick", event.target);
  event.preventDefault(); 

  const href = $(event.target).closest("a");
  console.log("href", href);
  history.pushState({}, "", href.attr("href"));

  handleRouteChange(); 
}

obtenerProductosJson();

function listProducts(products) {
  let container = $("#products");
  container.html("");
  let product;
  for (const producto of products) {
    let a = $("<a>")
      .attr("href", `/${producto.id}-${producto.marca}${producto.modelo}`)
      .addClass("a")
      .on("click", handleLinkClick);
    let div = $("<div>").addClass("card");
    let title = $("<p>")
      .text(`${producto.marca} ${producto.modelo}`)
      .addClass("card-title");
    let img = $("<img>").attr(
      "src",
      `./images/${producto.marca} ${producto.modelo}-img.png`
    );
    let cardFooter = $("<div>").addClass("cardFooter");
    let price = $("<p>").text(producto.precio / 100);
    let add = $("<div>").html("+");
    div.append(title);
    div.append(img);
    cardFooter.append(price);
    cardFooter.append(add);

    div.append(cardFooter);
    a.append(div);
    container.append(a);
  }
}
