let items = JSON.parse(localStorage.getItem('items')) || [];
let statuses = JSON.parse(localStorage.getItem('statuses')) || {};
const container = document.getElementById('container');

// referencje do modala
const editModal = document.getElementById('editModal');
const editName = document.getElementById('editName');
const editPrice = document.getElementById('editPrice');
const editImg = document.getElementById('editImg');
const editLink = document.getElementById('editLink');
const editCategory = document.getElementById('editCategory');
const saveEdit = document.getElementById('saveEdit');
const cancelEdit = document.getElementById('cancelEdit');
let editingItemId = null;

const toggleSelectAllBtn = document.getElementById('toggleSelectAll');

function updateToggleSelectAllText() {
  const checkboxes = document.querySelectorAll('.select-item');
  const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
  toggleSelectAllBtn.textContent = allChecked ? 'Odznacz wszystko' : 'Zaznacz wszystko';
}

toggleSelectAllBtn.addEventListener('click', () => {
  const checkboxes = document.querySelectorAll('.select-item');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  checkboxes.forEach(cb => cb.checked = !allChecked);
  updateToggleSelectAllText();
});

function render() {
  container.innerHTML = '';
  const categories = [...new Set(items.map(item => item.category))];
  categories.forEach(cat => {
    const catDiv = document.createElement('div');
    catDiv.className = 'category';
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'items-container';
    const title = document.createElement('h2');
    title.textContent = cat;
    catDiv.appendChild(title);


    items.filter(i => i.category === cat).forEach(item => {
      const div = document.createElement('div');
      div.className = 'item';

      // W miejscu, gdzie tworzysz div.item:
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'select-item';
      checkbox.dataset.id = item.id;
      checkbox.addEventListener('change', updateToggleSelectAllText);
      div.appendChild(checkbox);


      const img = document.createElement('img');
      img.src = item.img;
      div.appendChild(img);

      const name = document.createElement('p');
      name.textContent = item.name;
      div.appendChild(name);

      const price = document.createElement('p');
      price.textContent = item.price + ' zł';
      div.appendChild(price);

      const link = document.createElement('a');
      link.href = item.link;
      link.textContent = 'Link';
      link.target = '_blank';
      div.appendChild(link);



      div.appendChild(document.createElement('br'));

      // status button
      const button = document.createElement('button');
      const status = statuses[item.id] || 'chciany';
      button.textContent = status;
      button.className = status === 'chciany' ? 'wanted' : 'bought';
      button.addEventListener('click', () => {
        statuses[item.id] = statuses[item.id] === 'kupiony' ? 'chciany' : 'kupiony';
        localStorage.setItem('statuses', JSON.stringify(statuses));
        render();
        logWantedSum();
      });
      div.appendChild(button);

      // delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Usuń';
      deleteBtn.className = 'delete';
      deleteBtn.addEventListener('click', () => {
        items = items.filter(i => i.id !== item.id);
        delete statuses[item.id];
        localStorage.setItem('items', JSON.stringify(items));
        localStorage.setItem('statuses', JSON.stringify(statuses));
        render();
        logWantedSum();
      });
      div.appendChild(deleteBtn);

      // edit button
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edytuj';
      editBtn.className = 'wanted';
      editBtn.style.marginLeft = "5px";
      editBtn.addEventListener('click', () => {
        editingItemId = item.id;
        // wypełnij formularz aktualnymi danymi
        editName.value = item.name;
        editPrice.value = item.price;
        editImg.value = item.img;
        editLink.value = item.link;
        editCategory.value = item.category;
        editModal.style.display = 'flex';
      });
      div.appendChild(editBtn);

      itemsContainer.appendChild(div);
    });
    catDiv.appendChild(title);
    catDiv.appendChild(itemsContainer);
    container.appendChild(catDiv);
  });

  updateToggleSelectAllText();
}

function logWantedSum() {
  const h1laczna = document.getElementById("lacznacena");
  const sum = items.reduce((acc, item) => {
    const status = statuses[item.id] || 'chciany';
    return status === 'chciany' ? acc + item.price : acc;
  }, 0);
  console.log('Łączna cena wszystkich chcianych:', sum + ' zł');
  h1laczna.innerHTML = "Łączna cena wszystkich chcianych: " + sum + " zł";
}

// obsługa zapisu edycji
saveEdit.addEventListener('click', () => {
  if (editingItemId) {
    items = items.map(i => {
      if (i.id === editingItemId) {
        return {
          ...i,
          name: editName.value,
          price: parseFloat(editPrice.value),
          img: editImg.value,
          link: editLink.value,
          category: editCategory.value
        };
      }
      return i;
    });
    localStorage.setItem('items', JSON.stringify(items));
    render();
    logWantedSum();
    editingItemId = null;
    editModal.style.display = 'none';
  }
});

cancelEdit.addEventListener('click', () => {
  editingItemId = null;
  editModal.style.display = 'none';
});

// Twój formularz dodawania zostaje bez zmian
document.getElementById('addForm').addEventListener('submit', e => {
  e.preventDefault();
  const newItem = {
    id: Date.now(),
    name: document.getElementById('name').value,
    price: parseFloat(document.getElementById('price').value),
    img: document.getElementById('img').value,
    link: document.getElementById('link').value,
    category: document.getElementById('category').value
  };
  items.push(newItem);
  localStorage.setItem('items', JSON.stringify(items));
  render();
  logWantedSum();
  e.target.reset();
});

// zamykanie modala po kliknięciu w tło
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) {
    editingItemId = null;
    editModal.style.display = 'none';
  }
});

// eksport do JSON
document.getElementById('exportBtn').addEventListener('click', () => {
  // łączymy items + status w jeden obiekt
  const dataToExport = items.map(item => ({
    ...item,
    status: statuses[item.id] || 'chciany'
  }));

  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kako_itemy.json';
  a.click();
  URL.revokeObjectURL(url);
});


// obsługa importu JSON
document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);

      if (Array.isArray(importedData)) {
        // nowy format (lista produktów)
        items = importedData.map(({ status, ...rest }) => rest);
        statuses = {};
        importedData.forEach(prod => {
          statuses[prod.id] = prod.status || 'chciany';
        });
      } else if (importedData.items && importedData.statuses) {
        // stary format (dla kompatybilności)
        items = importedData.items;
        statuses = importedData.statuses;
      } else {
        throw new Error("Nieprawidłowy format JSON");
      }

      localStorage.setItem('items', JSON.stringify(items));
      localStorage.setItem('statuses', JSON.stringify(statuses));
      render();
      logWantedSum();
      alert("Dane zostały zaimportowane ✅");
    } catch (err) {
      alert("Błąd podczas odczytu pliku ❌");
    }
  };
  reader.readAsText(file);
});

// Pobiera wszystkie zaznaczone elementy
function getSelectedIds() {
  return Array.from(document.querySelectorAll('.select-item:checked')).map(cb => parseInt(cb.dataset.id));
}

// Masowe akcje
document.getElementById('bulkWantedBtn').addEventListener('click', () => {
  const selectedIds = getSelectedIds();
  selectedIds.forEach(id => statuses[id] = 'chciany');
  localStorage.setItem('statuses', JSON.stringify(statuses));
  render();
  logWantedSum();
});

document.getElementById('bulkBoughtBtn').addEventListener('click', () => {
  const selectedIds = getSelectedIds();
  selectedIds.forEach(id => statuses[id] = 'kupiony');
  localStorage.setItem('statuses', JSON.stringify(statuses));
  render();
  logWantedSum();
});

document.getElementById('bulkDeleteBtn').addEventListener('click', () => {
  const selectedIds = getSelectedIds();
  items = items.filter(item => !selectedIds.includes(item.id));
  selectedIds.forEach(id => delete statuses[id]);
  localStorage.setItem('items', JSON.stringify(items));
  localStorage.setItem('statuses', JSON.stringify(statuses));
  render();
  logWantedSum();
});

render();
logWantedSum();

const darkModeToggle = document.getElementById('darkModeToggle');

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  // zapis do localStorage, żeby zapamiętać wybór
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.setItem('darkMode', 'disabled');
  }
});

// przy starcie strony ustaw tryb ciemny jeśli był wcześniej włączony
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
}
