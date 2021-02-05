const log = console.log.bind(console);
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const iconv = require("iconv-lite");

//TODO:知乎
const getHotList = async () => {
  const res = await axios.get("https://www.zhihu.com/billboard");
  const $ = cheerio.load(res.data);
  const data = $("#js-initialData").html();
  const hotJson = JSON.parse(data);
  const hotList = hotJson["initialState"]["topstory"]["hotList"];

  fs.writeFile("./hotList.json", JSON.stringify(hotList), "utf8", () => {});
};

const getQuestion = async (id) => {
  const url = `https://www.zhihu.com/question/${id}`;
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const data = $("#js-initialData").html();
  const dataJson = JSON.parse(data);
  const questionData = dataJson["initialState"]["entities"]["questions"];
  const answerData = dataJson["initialState"]["entities"]["answers"];
};

//TODO:微博
const getWeiBo = async () => {
  const res = await axios.get("https://s.weibo.com/top/summary");
  const $ = cheerio.load(res.data);
  const data = $(".list_a li a");

  const hotList = [];
  for (const item of data) {
    const url = $(item).attr("href");
    const title = $(item).find("span").text();
    const heat = $(item).find("span em").text();
    hotList.push({
      url: "https://s.weibo.com" + url,
      title: title.replace(heat + " ", ""),
      heat,
    });
  }

  return hotList;
};

//TODO: V2Ex
const getV2ex = async () => {
  const res = await axios.get("https://www.v2ex.com/?tab=hot");
  const $ = cheerio.load(res.data);
  const data = $(".item_title a");

  const hotList = [];
  for (const item of data) {
    const url = $(item).attr("href");
    const title = $(item).text();
    hotList.push({
      heat: url.split("#reply")[1],
      url: "https://www.v2ex.com" + url,
      title,
    });
  }

  return hotList;
};

//TODO: TieBa
const getTieBa = async () => {
  const res = await axios.get(
    "http://tieba.baidu.com/hottopic/browse/topicList"
  );
  const hotList = res.data.data["bang_topic"]["topic_list"];
  return hotList;
};

//TODO:豆瓣电影一周口碑榜
const getDouBanMovie = async () => {
  const res = await axios.get("https://movie.douban.com/chart");
  const hotList = [];
  const $ = cheerio.load(res.data);
  const weeklyData = $("#listCont2 li .name a");
  for (const item of weeklyData) {
    const url = $(item).attr("href");
    const title = $(item).text();
    hotList.push({
      url,
      title: title.replace(/\ +|[\r\n]/g, ""),
    });
  }
  return hotList;
};

//TODO:Github 周榜趋势
const getGithub = async () => {
  const res = await axios.get("https://github.com/trending?since=weekly");
  const hotList = [];
  const $ = cheerio.load(res.data);
  const weeklyData = $(".Box-row");
  for (const item of weeklyData) {
    const url = $(item).find("h1 a").attr("href");
    const text = $(item).find("p").text();
    const language = $(item).find("span[itemprop=programmingLanguage]").text();
    const allData = $(item).find(".mt-2 a").text().split("\n\n");
    const allStart = allData[0].replace(/\ +|[\r\n]/g, "");
    const allFork = allData[1].replace(/\ +|[\r\n]/g, "");
    const weekStart = $(item).find(".mt-2 .float-sm-right").text();

    hotList.push({
      url: "https://github.com" + url,
      language,
      title: url,
      text: text.replace(/[\r\n]/g, "").trim(),
      allStart,
      allFork,
      weekStart: weekStart.replace(/\ +|[\r\n]|stars this week/g, ""),
    });
  }
  return hotList;
};

//TODO:百度
const getBaidu = async () => {
  const res = await axios.get("http://top.baidu.com/buzz?b=341&fr=topbuzz_b1", {
    responseType: "arraybuffer",
  });

  const hotList = [];
  const buf = Buffer.from(res.data);
  const body = iconv.decode(Buffer.concat([buf]), "gbk");
  const $ = cheerio.load(body);
  const todayData = $(".list-title");

  for (const item of todayData) {
    const url = $(item).attr("href");
    const title = $(item).html();
    hotList.push({
      url: url,
      title: title,
    });
  }
  return hotList;
};

const _main = async () => {
  // getHotList();
  // getQuestion("442907371");
  log(await getBaidu());
};

_main();
