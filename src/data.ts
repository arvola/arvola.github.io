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

// We can just render the categories and links right away, since the script is at the bottom of the HTML.
const boxes = document.getElementById("boxes") as HTMLDivElement;
for (let cat of data) {
    boxes.insertAdjacentHTML("beforeend", html`
        <div class="box">
            <div class="box-title">
                <div class="box-icon-wrap">
                </div>
                <h2>${cat.title}</h2>
            </div>
            <div class="cards"></div>
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
        cards.insertAdjacentHTML("beforeend", html`
            <a href="${link.url}" class="card-link">
                <div class="business-card">
                    <div class="logo-holder">
                        <div class="logo-backer"></div>
                        <img src="${logo}" alt="" />
                    </div>
                    <div class="text-holder">
                        <div class="card-name">${link.name}</div>
                        <div class="card-text">${link.subtitle}</div>
                    </div>
                </div>
            </a>`)
    }
}
