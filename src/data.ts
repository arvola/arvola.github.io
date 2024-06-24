import data from "./data.json";
import { html } from "./template.ts";

export interface Link {
    category: string;
    name: string;
    subtitle: string;
    url: string;
    logo?: string;
}

export interface Category {
    title: string;
    links: Link[];
    icon?: string;
}

let linkIndex = 1;

// We can just render the categories and links right away, since the script is at the bottom of the HTML.
const boxes = document.getElementById("boxes") as HTMLDivElement;
for (let cat of data) {
    boxes.insertAdjacentHTML("beforeend", html`
        <div class="box">
            <div class="box-title">
                <div class="box-icon-wrap" aria-hidden="true">
                </div>
                <h2>${cat.title}</h2>
            </div>
            <ul class="cards"></ul>
        </div>`);
    const box = boxes.lastElementChild as HTMLDivElement;
    const cards = box.querySelector(".cards") as HTMLDivElement;
    const iconWrap = box.querySelector(".box-icon-wrap") as HTMLDivElement;
    const icon = (document.querySelector(`#icon-${cat.icon}`) as HTMLTemplateElement)?.content?.cloneNode(true);

    if (icon) {
        iconWrap.appendChild(icon);
    }

    for (let link of cat.links) {
        let logo: string = "";
        if (link.logo) {
            logo = new URL(`./links/${link.logo}`, import.meta.url).href;
        }
        let i = linkIndex++;
        cards.insertAdjacentHTML("beforeend", html`
            <li class="card-link">
                <article class="business-card">
                    <div class="logo-holder">
                        <div class="logo-backer"></div>
                        <img src="${logo}" alt="" />
                    </div>
                    <div class="text-holder">
                        <div class="card-name">
                            <a href="${link.url}" aria-describedby="link-${i}">${link.name}</a>
                        </div>
                        <div class="card-text" id="link-${i}">${link.subtitle}</div>
                    </div>
                </article>
            </li>`)
    }
}
