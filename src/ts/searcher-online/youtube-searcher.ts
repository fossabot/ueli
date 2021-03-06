import { SearcherOnline } from "./searcher";
import { SearchResultItem } from "../search-result-item";
import * as cheerio from "cheerio";
import * as fetch from "node-fetch";
import * as fs from "fs";

export class YoutubeSearcher implements SearcherOnline {
    public getSearchResult(userInput: string): Promise<SearchResultItem[]> {
        userInput = userInput.replace("y!", "");
        return new Promise<SearchResultItem[]>((resolve) => {
            fetch.default(`https://youtube.com/results?search_query=${encodeURIComponent(userInput)}`)
                .then((response) => response.text())
                .then((response) => {
                    const $ = cheerio.load(response);

                    const results = $(".yt-lockup-video")
                        .filter((i, e) => !("data-ad-impressions" in e.attribs));

                    const items = [] as SearchResultItem[];

                    $(results).each((i, el) => {
                        const title = $(el).find("h3.yt-lockup-title a");
                        const link = title.attr("href");
                        const channel = $(el).find("div.yt-lockup-byline a");

                        const thumbEl = $(el).find("span.yt-thumb-simple img");
                        let thumbLink = thumbEl.attr("src");

                        if (thumbLink.match(/\.gif/)) {
                            thumbLink = thumbEl.attr("data-thumb");
                        }

                        items.push({
                            breadCrumb: [channel.text()],
                            executionArgument: `https://youtube.com${link}`,
                            icon: `<img src="${thumbLink} width="30" height="30"></img>`,
                            name: title.text(),
                            tags: [],
                        } as SearchResultItem);
                    });

                    resolve(items);
                });
        });
    }
}
