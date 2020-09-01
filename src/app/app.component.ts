import { async } from '@angular/core/testing';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  TAG: string = '';
  API_KEY: string;
  response: any;
  imgArr: string[][];
  tagGroup: string[] = [];
  grouping: boolean = false;

  constructor(private http: HttpClient) {

  }

  ngOnInit() {
    this.API_KEY = 'HIVdd3ux75mKHwMEaoBWxfWYnv34Ny6c';
    this.imgArr = [];
    this.tagGroup = [];
  }

  async searchTag(tagForSearch) {
    const inputElem: HTMLElement = document.getElementById('tagForSearch');
    const loadButton: HTMLElement = document.querySelector('.btn-success');

    if (!tagForSearch) {
      const hint: HTMLElement = document.querySelector('.alert');

      hint.style.display = 'flex';
      hint.style.top = `${inputElem.offsetTop + inputElem.offsetHeight + 5}px`;
      hint.style.left = `${inputElem.offsetLeft}px`;

      setTimeout(() => {
        hint.style.display = 'none'
      }, 3000)
      return;
    }

    await (() => {
      loadButton.textContent = 'Загрузка...';
      loadButton.setAttribute('disabled', 'true');
    })();

    this.TAG = tagForSearch;

    const response = await this.http.get(`https://api.giphy.com/v1/gifs/random?api_key=${this.API_KEY}&tag=${this.TAG}`);

    await response.subscribe(
      (response) => {
        this.response = response;

        if (this.response.data.image_url === undefined) {
          alert('По тегу ничего не найдено');
          return;
        };

        this.imgArr.push([`${this.response.data.image_url}`, `${this.TAG}`]);

        if (this.grouping) {
          const lastImg: string[] = this.imgArr[this.imgArr.length - 1];

          if (!this.tagGroup.includes(lastImg[1])) {
            this.createTagGroup(lastImg);
          } else {
            this.extendTagGroup(lastImg);
          }
        }
    },
      (error) => {
        if (error.status !== 200) {
          alert('Произошла http ошибки');
        }
    });

    //для наглядности
    await setTimeout( () => {
      loadButton.textContent = 'Загрузить';
      loadButton.removeAttribute('disabled');
    }, 500);
  }

  clear(): void {
    if (this.imgArr.length == 0) {
      return;
    }

    this.imgArr = [];
    this.response = false;
    this.TAG = '';

    const imgDisplay: HTMLElement = document.getElementById('imgDisplay');

    imgDisplay.remove();

    if (this.tagGroup) {
      this.ungroup();
    }
  }

  group(): void {
    if (this.imgArr.length == 0) {
      return;
    }

    if (!this.grouping) {
      this.grouping = true;
    } else {
      this.ungroup();
      return;
    }

    const groupButton: HTMLElement = document.querySelector('.btn-primary');
    const imgDisplay: HTMLElement = document.getElementById(`imgDisplay`);

    imgDisplay.style.display = 'none';
    groupButton.textContent = 'Разгруппировать';

    for (let img of this.imgArr) {
      if (!this.tagGroup.includes(img[1])) {
        this.createTagGroup(img);
      } else {
        this.extendTagGroup(img);
      }
    }
  }

  createTagGroup(img) {
    this.tagGroup.push(img[1]);

    const tagDiv: HTMLElement = document.createElement('div');
    const tagTitle: HTMLElement = document.createElement('p');

    tagDiv.id = `tag${img[1]}`;
    tagTitle.textContent = `${img[1]}`;
    tagDiv.prepend(tagTitle);
    tagDiv.append(this.createImg(img));

    const container: HTMLElement = document.querySelector('.container');

    container.append(tagDiv);
  }

  extendTagGroup(img) {
    document.getElementById(`tag${img[1]}`).append(this.createImg(img));
  }

  createImg(img) {
    const newImgContainer: HTMLElement = document.createElement('div');
    const newImg: HTMLImageElement = document.createElement('img');

    newImgContainer.className = 'img-container img-thumbnail';

    newImg.src = img[0];
    newImg.alt = img[1];
    newImg.onclick = this.copyTag.bind(this);

    newImgContainer.append(newImg);

    return newImgContainer;
  }

  ungroup() {
    this.grouping = false;
    this.tagGroup = [];

    const groupButton: HTMLElement = document.querySelector('.btn-primary');
    const allTagDiv = document.querySelectorAll('div[id^="tag"]');
    const imgDisplay: HTMLElement = document.getElementById(`imgDisplay`);

    groupButton.textContent = 'Группировать';

    allTagDiv.forEach((elem) => {
      elem.remove();
    });

    if (imgDisplay !== null) {
      imgDisplay.style.display = 'flex';
    };
  }

  copyTag(event) {
    const img: HTMLImageElement = event.target;
    this.TAG = img.alt;
  }
};
