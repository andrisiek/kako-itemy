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

    // nagłówek + przycisk "Zaznacz kategorię"
    const header = document.createElement('div');
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.gap = "10px";

    const title = document.createElement('h2');
    title.textContent = cat;

    const selectAllBtn = document.createElement('button');
    selectAllBtn.textContent = "Zaznacz kategorię";
    selectAllBtn.style.padding = "5px 10px";
    selectAllBtn.style.border = "none";
    selectAllBtn.style.borderRadius = "6px";
    selectAllBtn.style.cursor = "pointer";
    selectAllBtn.style.background = "#b22222";
    selectAllBtn.style.color = "white";
    selectAllBtn.addEventListener('click', () => {
      const checkboxes = itemsContainer.querySelectorAll('.select-item');
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      checkboxes.forEach(cb => cb.checked = !allChecked);
      updateToggleSelectAllText();
    });

    header.appendChild(title);
    header.appendChild(selectAllBtn);
    catDiv.appendChild(header);

    items.filter(i => i.category === cat).forEach(item => {
      const div = document.createElement('div');
      div.className = 'item';

      // checkbox
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
      const status = statuses[item.id] || 'teraz';
      button.textContent = status === 'teraz' ? 'Teraz' : 'Później';
      button.className = status === 'teraz' ? 'wanted' : 'bought';
      button.addEventListener('click', () => {
        statuses[item.id] = statuses[item.id] === 'pozniej' ? 'teraz' : 'pozniej';
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

    catDiv.appendChild(itemsContainer);
    container.appendChild(catDiv);
  });

  updateToggleSelectAllText();
}

function logWantedSum() {
  const h1laczna = document.getElementById("lacznacena");
  const sum = items.reduce((acc, item) => {
    const status = statuses[item.id] || 'teraz';
    return status === 'teraz' ? acc + item.price : acc;
  }, 0);
  console.log('Łączna cena wszystkich teraz:', sum + ' zł');
  h1laczna.innerHTML = "Łączna cena wszystkich teraz: " + sum + " zł";
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

// formularz dodawania
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

// zamykanie modala
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) {
    editingItemId = null;
    editModal.style.display = 'none';
  }
});

// eksport do JSON
document.getElementById('exportBtn').addEventListener('click', () => {
  const dataToExport = items.map(item => ({
    ...item,
    status: statuses[item.id] || 'teraz'
  }));

  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kako_itemy.json';
  a.click();
  URL.revokeObjectURL(url);
});

// import JSON
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
        items = importedData.map(({ status, ...rest }) => rest);
        statuses = {};
        importedData.forEach(prod => {
          statuses[prod.id] = prod.status || 'teraz';
        });
      } else if (importedData.items && importedData.statuses) {
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

// zaznaczone elementy
function getSelectedIds() {
  return Array.from(document.querySelectorAll('.select-item:checked')).map(cb => parseInt(cb.dataset.id));
}

// masowe akcje
document.getElementById('bulkWantedBtn').addEventListener('click', () => {
  const selectedIds = getSelectedIds();
  selectedIds.forEach(id => statuses[id] = 'teraz');
  localStorage.setItem('statuses', JSON.stringify(statuses));
  render();
  logWantedSum();
});

document.getElementById('bulkBoughtBtn').addEventListener('click', () => {
  const selectedIds = getSelectedIds();
  selectedIds.forEach(id => statuses[id] = 'pozniej');
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
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.setItem('darkMode', 'disabled');
  }
});

if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
}
