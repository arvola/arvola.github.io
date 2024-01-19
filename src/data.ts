
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
