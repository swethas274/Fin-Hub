
import { NEWS_API_KEY } from '../constants';
import type { NewsArticle } from '../types';

const BASE_URL = 'https://newsapi.org/v2/everything';

export const fetchNews = async (query: string): Promise<NewsArticle[]> => {
    // get dates for the last 10 days
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 10);

    const url = new URL(BASE_URL);
    url.searchParams.append('q', `"${query}" OR stock`);
    url.searchParams.append('apiKey', NEWS_API_KEY);
    url.searchParams.append('sortBy', 'publishedAt');
    url.searchParams.append('language', 'en');
    url.searchParams.append('pageSize', '20'); // Get more articles for better analysis
    url.searchParams.append('from', from.toISOString().split('T')[0]);
    url.searchParams.append('to', to.toISOString().split('T')[0]);

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error('Failed to fetch news');
    }
    const data = await response.json();
    return data.articles as NewsArticle[];
};
