const FILENAME = 'flights.json';

const filterParams = {
  filterConnectRoute: 0,
  filterDirectRoute: 0,
  priceMin: 0,
  priceMax: 1000000,
  companies: {},
}
let countRoutes = 2;
const aviacompanies = [];
const mainContainer = document.querySelector('.container');
const flightsFilter = document.createElement('div');
flightsFilter.className = "filter";
flightsFilter.innerHTML = `
<form id="form_filter" action="" method="get">
        <div class="sort">
          <h3>Сортировать</h3>
          <label for="sort_by_price_increase">
            <input type="radio" name="sort" id="sort_by_price_increase" onchange="sortByPriceIncrease()">
            - по возрастанию цены
          </label>
          <label for="sort_by_price_decrease">
            <input type="radio" name="sort" id="sort_by_price_decrease" onchange="sortByPriceDecrease()">
            - по убыванию цены
          </label>
          <label for="sort_by_time">
            <input type="radio" name="sort" id="sort_by_time" onchange="sortByTime()">
            - по времени в пути
          </label>
        </div>
        <div class="filter_by_route">
          <h3>Фильтровать</h3>
          <label for="filter_connect_route">
            <input type="checkbox" name="filter_route" id="filter_connect_route"
              onchange="setFilterConnectRoute(checked)">
            - 1 пересадка
          </label>
          <label for="filter_direct_route">
            <input type="checkbox" name="filter_route" id="filter_direct_route"
              onchange="setFilterDirectRoute(checked)">
            - без пересадок
          </label>
        </div>
        <div class="filter_by_price">
          <h3>Цена</h3>
          <label for="price_min">
            От
            <input name="price" id="price_min" value="0" onchange="setPriceMin(+value)">
          </label>
          <label for="price_max">
            До
            <input name="price" id="price_max" value="1000000" onchange="setPriceMax(+value)">
          </label>
        </div>
        <div class="filter_by_company">
          <h3>Авиакомпании</h3>
        </div>
      </form>
`

const listMore = document.createElement('div');
listMore.id = "list_more";
listMore.innerHTML = `
<div id="list">
      </div>
      <input type="button" class="more" value="Показать еще" onclick="seeMore()">
`

mainContainer.appendChild(flightsFilter);
mainContainer.appendChild(listMore);




const list = document.querySelector('#list');

const getData = (filename) => {
  let myRequest = new XMLHttpRequest();
  let data;
  myRequest.open('GET', filename, false);
  myRequest.onload = function () {
    data = JSON.parse(myRequest.responseText);
  }
  myRequest.send();
  return data;
}

const flights = getData(FILENAME).result.flights;
const month = ['янв.', 'фев.', 'мар.', 'апр.', 'май', 'июн.', 'июл.', 'авг.', 'сен.', 'окт.', 'ноя.', 'дек.'];
const days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const getDate1 = (date1) => {
  date = new Date(date1);
  return date.getHours() + ':' + date.getMinutes() + ' ' + date.getDate() + ' ' + month[date.getMonth()]
    + ' ' + days[date.getDay()];
}
const getDate2 = (date2) => {
  date = new Date(date2);
  return date.getDate() + ' ' + month[date.getMonth()] + ' ' + days[date.getDay()] + ' ' + date.getHours()
    + ':' + date.getMinutes();
}

// Функция отрисовки списка перелётов
const renderList = (flights, countRoutes, filterParams) => {
  // const flights = getData(FILENAME).result.flights;

  for (let index = 0, index_j = 0; index_j < countRoutes; index++) {
    if (flights[index]) {
      const flight = flights[index].flight;
      if (flight.price.total.amount >= filterParams.priceMin
        && flight.price.total.amount <= filterParams.priceMax
        && (filterParams.filterConnectRoute == 0
          || (filterParams.filterConnectRoute == 1 && flight.legs[0].segments[1] && !flight.legs[1].segments[1])
          || (filterParams.filterConnectRoute == 1 && flight.legs[1].segments[1] && !flight.legs[0].segments[1]))
        && (filterParams.filterDirectRoute == 0
          || filterParams.filterDirectRoute == 1 && !flight.legs[0].segments[1] && !flight.legs[1].segments[1])
        && (Object.keys(filterParams.companies).length == 0
          || filterParams.companies[flight.carrier.caption])) {
        renderListItem(flight);
        index_j++;
      }
    } else {
      break;
    }
  }
}

// Функция отрисовки элемента списка перелётов
const renderListItem = (flight) => {
  // const flight = flights[i].flight;
  s1 = flight.legs[0].segments[1] ? 1 : 0;
  s2 = flight.legs[1].segments[1] ? 1 : 0;
  const listItem = document.createElement('div');
  listItem.className = "list_item";
  listItem.innerHTML = `
  <div class="header">
          <div class="header_logo">
          ${flight.carrier.caption}
          </div>
          <div class="header_price">
          ${flight.price.total.amount} &#8381
            <span>Стоимость для одного взрослого пассажира</span>
          </div>
        </div>
  <div class="sublist">
    <div class="sublist_item">
      <div class="sublist_item_route">
        ${flight.legs[0].segments[0].departureCity.caption
    + ', ' + flight.legs[0].segments[0].departureAirport.caption
    + ' ' + flight.legs[0].segments[0].departureAirport.uid}
        &#8594
        ${flight.legs[0].segments[s1].arrivalCity.caption
    + ', ' + flight.legs[0].segments[s1].arrivalAirport.caption
    + ' ' + flight.legs[0].segments[s1].arrivalAirport.uid}
      </div>
      <div class="sublist_item_time">
        ${getDate1(flight.legs[0].segments[0].departureDate)}
        &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp
        &#8986
        ${Math.floor(flight.legs[0].duration / 60) + ' ч'
    + ' ' + flight.legs[0].duration % 60 + ' мин'
    + '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp  '
    + getDate2(flight.legs[0].segments[s1].arrivalDate)}
      </div>
      <div class="sublist_item_transfer">
        <hr>
          ${flight.legs[0].segments[1] ? ' 1 пересадка ' : ''}
          <hr>
          </div>
          <div class="sublist_item_company">Рейс выполняет:
            ${flight.legs[0].segments[0].operatingAirline
      ? flight.legs[0].segments[0].operatingAirline.caption
      : flight.legs[0].segments[0].airline.caption}
          </div>
      </div>
      <div class="sublist_item">
        <div class="sublist_item_route">
          ${flight.legs[1].segments[0].departureCity.caption
    + ', ' + flight.legs[1].segments[0].departureAirport.caption
    + ' ' + flight.legs[1].segments[0].departureAirport.uid}
          &#8594
          ${flight.legs[1].segments[s2].arrivalCity.caption
    + ', ' + flight.legs[1].segments[s2].arrivalAirport.caption
    + ' ' + flight.legs[1].segments[s2].arrivalAirport.uid}
        </div>
        <div class="sublist_item_time">
          ${getDate1(flight.legs[1].segments[0].departureDate)}
          &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp
          &#8986
          ${Math.floor(flight.legs[1].duration / 60) + ' ч'
    + ' ' + flight.legs[1].duration % 60 + ' мин'
    + '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp  '
    + getDate2(flight.legs[1].segments[s2].arrivalDate)}
        </div>
        <div class="sublist_item_transfer">
          <hr>
            ${flight.legs[1].segments[1] ? ' 1 пересадка ' : ''}
            <hr>
            </div>
            <div class="sublist_item_company">Рейс выполняет:
              ${flight.legs[1].segments[0].operatingAirline
      ? flight.legs[1].segments[0].operatingAirline.caption
      : flight.legs[1].segments[0].airline.caption}
            </div>
        </div>
      </div>
      <input type="button" class="choose" value="ВЫБРАТЬ">
    </div>
    `
  list.appendChild(listItem);
}

// Функция перерисовки списка перелётов
const rerenderList = () => {
  document.querySelector('#list').innerHTML = '';
  renderList(flights, countRoutes, filterParams);
}

renderList(flights, countRoutes, filterParams);

// Функция добавления отображаемых элементов списка перелётов
const seeMore = () => {
  countRoutes += 2;
  rerenderList();
}

// Функция сортировки по возрастанию цены
const sortByPriceIncrease = () => {
  flights.sort((a, b) => {
    return a.flight.price.total.amount - b.flight.price.total.amount;
  });
  rerenderList();
}

// Функция сортировки по убыванию цены
const sortByPriceDecrease = () => {
  flights.sort((a, b) => {
    return b.flight.price.total.amount - a.flight.price.total.amount;
  });
  rerenderList();
}

// Функция сортировки по времени в пути
const sortByTime = () => {
  flights.sort((a, b) => {
    return (a.flight.legs[0].duration + a.flight.legs[1].duration)
      - (b.flight.legs[0].duration + b.flight.legs[1].duration);
  });
  rerenderList();
}

// Функция установки фильтра минимальной цены
const setPriceMin = (value) => {
  if (Number.isInteger(value)) {
    filterParams.priceMin = value;
    rerenderList();
  }
}

// Функция установки фильтра максимальной цены
const setPriceMax = (value) => {
  if (Number.isInteger(value)) {
    filterParams.priceMax = value;
    rerenderList();
  }
}

// Функция фильтрации по перелётам с одной пересадкой
const setFilterConnectRoute = (value) => {
  if (value) {
    filterParams.filterConnectRoute = 1;
  } else {
    filterParams.filterConnectRoute = 0;
  }
  rerenderList();
}

// Функция фильтрации по прямому перелёту
const setFilterDirectRoute = (value) => {
  if (value) {
    filterParams.filterDirectRoute = 1;
  } else {
    filterParams.filterDirectRoute = 0;
  }
  rerenderList();
}

// Функция фильтрации по названию авиакомпании
const setFilterCompany = (name, checked) => {
  if (checked) {
    filterParams.companies[name] = checked;
  } else {
    delete filterParams.companies[name];
  }
  rerenderList();
}

// Создание списка авиакомпаний + минимальная цена перелёта
flights.forEach(element => {
  if (!aviacompanies.find(company => company.name === element.flight.carrier.caption)) {
    aviacompanies.push({ name: element.flight.carrier.caption, price: element.flight.price.total.amount });
  }
  aviacompanies.forEach(company => {
    if (company.name === element.flight.carrier.caption && +company.price > +element.flight.price.total.amount)
      company.price = element.flight.price.total.amount;
  });
});

// Отрисовка фильтра по авиакомпаниям
const listCompanies = document.querySelector('.filter_by_company');
aviacompanies.forEach(company => {
  const listCompaniesItem = document.createElement('label');
  listCompaniesItem.className = "list_item";
  listCompaniesItem.innerHTML = `
    <input type="checkbox" name="filter_company" id="${company.name}" onchange="setFilterCompany(id, checked)">
      <span class="long_name">${company.name}</span> <span>от ${company.price} р.</span>
      `
  listCompanies.appendChild(listCompaniesItem);
})