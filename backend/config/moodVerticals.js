// config/moodVerticals.js
module.exports = {
  sad: [
    {
      key:     'upliftMusic',
      title:   'Uplifting Music',
      query:   'feel good songs',
      filters: { minViews: 100_000, maxDurationSec: 300 }, // <5m
    },
    {
      key:     'motivationalTalks',
      title:   'Motivational Talks',
      query:   'motivational speech 2025',
      filters: { publishedWithinDays: 180 }, // last 6 months
    },
    {
      key:     'comedyClips',
      title:   'Comedy Clips',
      query:   'standup comedy best bits',
      filters: { maxDurationSec: 600 }, // <10m
    },
    {
      key:     'shortEscapes',
      title:   'Short Escapes',
      query:   'relaxing nature short',
      filters: { maxDurationSec: 180 }, // <3m
    },
    {
      key:     'deepDives',
      title:   'Deep Dives',
      query:   'guided meditation full session',
      filters: { minDurationSec: 600 }, // >10m
    },
  ],
  angry: [ /* similar array */ ],
  happy: [ /* … */ ],
  relaxed: [ /* … */ ],
  default: [
    { key:'trendingMusic',   title:'Popular Music',      query:'top music videos 2025' },
    { key:'trendingGeneral', title:'Trending Now',      query:'most popular videos' },
  ],
};
