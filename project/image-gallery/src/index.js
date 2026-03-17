import './styles.css';

class ImageItem {
  constructor(id, name, url) {
    this.id = id;
    this.name = name;
    this.url = url;
  }
}

class ImageStore {
  constructor() {
    this.images = [];
    this.nextId = 1;
  }

  addImage(name, url) {
    const image = new ImageItem(this.nextId++, name, url);
    this.images.push(image);
    return image;
  }

  removeImage(id) {
    this.images = this.images.filter(img => img.id !== id);
  }

  getImages() {
    return this.images;
  }
}

class ImageView {
  constructor() {
    this.nameInput = document.getElementById('imageName');
    this.urlInput = document.getElementById('imageUrl');
    this.addBtn = document.getElementById('addBtn');
    this.urlError = document.getElementById('urlError');
    this.gallery = document.getElementById('gallery');
  }

  hideError() {
    this.urlError.style.display = 'none';
    this.urlInput.classList.remove('error');
  }

  showError() {
    this.urlError.style.display = 'block';
    this.urlInput.classList.add('error');
  }

  clearInputs() {
    this.nameInput.value = '';
    this.urlInput.value = '';
  }

  getNameValue() {
    return this.nameInput.value.trim();
  }

  getUrlValue() {
    return this.urlInput.value.trim();
  }

  addImageElement(image) {
    const imageCard = document.createElement('div');
    imageCard.classList.add('image-card');
    imageCard.dataset.id = image.id;

    const imgElement = document.createElement('img');
    imgElement.src = image.url;
    imgElement.alt = image.name;
    imgElement.classList.add('image-element');

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('image-info');

    const nameSpan = document.createElement('span');
    nameSpan.classList.add('image-name');
    nameSpan.textContent = image.name;

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Удалить';

    infoDiv.appendChild(nameSpan);
    infoDiv.appendChild(deleteBtn);
    imageCard.appendChild(imgElement);
    imageCard.appendChild(infoDiv);
    this.gallery.appendChild(imageCard);
  }

  removeImageElement(id) {
    const card = this.gallery.querySelector(`[data-id="${id}"]`);
    if (card) {
      card.remove();
    }
  }

  setAddHandler(handler) {
    this.addBtn.addEventListener('click', handler);
    
    this.urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handler();
      }
    });
    
    this.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handler();
      }
    });
  }

  setDeleteHandler(handler) {
    this.gallery.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-btn')) {
        const card = e.target.closest('.image-card');
        if (card) {
          handler(parseInt(card.dataset.id));
        }
      }
    });
  }
}

class ImageValidator {
  static validateUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        resolve(true);
      };
      
      img.onerror = () => {
        resolve(false);
      };
      
      img.src = url;
    });
  }
}

class ImageGallery {
  constructor() {
    this.store = new ImageStore();
    this.view = new ImageView();
    
    this.init();
  }

  init() {
    this.view.setAddHandler(() => this.handleAdd());
    this.view.setDeleteHandler((id) => this.handleDelete(id));
  }

  async handleAdd() {
    this.view.hideError();

    const name = this.view.getNameValue();
    const url = this.view.getUrlValue();

    if (!name || !url) {
      this.view.showError();
      return;
    }

    const isValid = await ImageValidator.validateUrl(url);

    if (!isValid) {
      this.view.showError();
      return;
    }

    const image = this.store.addImage(name, url);
    this.view.addImageElement(image);
    this.view.clearInputs();
  }

  handleDelete(id) {
    this.store.removeImage(id);
    this.view.removeImageElement(id);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ImageGallery();
});
