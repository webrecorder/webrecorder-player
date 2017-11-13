import { createSelector } from 'reselect';
import { List } from 'immutable';
import { getSearchSelectors } from 'redux-search';

import { rts } from 'helpers/utils';


const getArchives = state => state.getIn(['controls', 'archives']);
const getBookmarks = (state) => { const stateObj = state.app ? state.app : state; return stateObj.getIn(['collection', 'bookmarks']); };
const getRecordings = state => state.getIn(['collection', 'recordings']);
const getSize = state => state.getIn(['infoStats', 'size']);
const getStats = state => state.getIn(['infoStats', 'stats']);
const getTimestamp = (state) => { const stateObj = state.app ? state.app : state; return stateObj.getIn(['controls', 'timestamp']); };
const getUrl = (state) => { const stateObj = state.app ? state.app : state; return stateObj.getIn(['controls', 'url']); };
const userSortBy = (state) => { const stateObj = state.app ? state.app : state; return stateObj.getIn(['collection', 'sortBy']); };

const sortFn = (a, b, by = null) => {
  if (by) {
    if (a.get(by) > b.get(by)) return -1;
    if (a.get(by) < b.get(by)) return 1;
  } else {
    if (a > b) return -1;
    if (a < b) return 1;
  }
  return 0;
};

// redux-search
const { text, result } = getSearchSelectors({
  resourceName: 'bookmarks',
  resourceSelector: (resourceName, state) => {
    const items = state.app.getIn(['collection', resourceName]);
    return items;
  }
});

export const timestampOrderedBookmarkSearchResults = createSelector(
  [result, getBookmarks, text],
  (bookmarkIds, bookmarkObjs, searchText) => {
    const bookmarks = List(bookmarkIds.map(id => bookmarkObjs.get(id)));
    const bookmarkFeed = bookmarks.sortBy(o => o.get('timestamp')).reverse();

    return {
      bookmarkFeed,
      searchText
    };
  }
);

export const bookmarkSearchResults = createSelector(
  [result, getBookmarks, userSortBy, text],
  (bookmarkIds, bookmarkObjs, sortBy, searchText) => {
    const bookmarks = List(bookmarkIds.map(id => bookmarkObjs.get(id)));
    const sort = sortBy.get('sort');
    const dir = sortBy.get('dir');
    const bookmarkFeed = bookmarks.sortBy(o => o.get(sort));

    if (dir === 'DESC') {
      return {
        bookmarkFeed: bookmarkFeed.reverse(),
        searchText
      };
    }
    return {
      bookmarkFeed,
      searchText
    };
  }
);


export const getOrderedRecordings = createSelector(
  [getRecordings],
  (recordings) => {
    const sortedRecordings = recordings.sortBy(o => o.get('created_at')).toOrderedSet();

    return sortedRecordings;
  }
);


export const timestampOrderedBookmarks = createSelector(
  [getBookmarks],
  (bookmarks) => {
    return bookmarks.toList().sortBy(b => b.get('timestamp')).reverse();
  }
);


//let lastBookmarks = null;
export const getOrderedBookmarks = createSelector(
  getBookmarks, userSortBy,
  (bookmarks, sortBy) => {
    //console.log('running', 'getOrderedBookmarks', bookmarks === lastBookmarks, is(bookmarks, lastBookmarks));
    //lastBookmarks = bookmarks;
    const sort = sortBy.get('sort');
    const dir = sortBy.get('dir');
    const sortedBookmarks = bookmarks.toList().sortBy(o => o.get(sort));

    if (dir === 'DESC') {
      return sortedBookmarks.reverse();
    }
    return sortedBookmarks;
  }
);


const bkmSearch = (bookmarks, ts, url) => {
  if (!ts) {
    const idx = bookmarks.findIndex((b) => { return b.get('url') === url || rts(b.get('url')) === rts(url); });
    return idx === -1 ? 0 : idx;
  }

  const item = { url, ts: parseInt(ts, 10) };
  let minIdx = 0;
  let maxIdx = bookmarks.size - 1;
  let curIdx;
  let curUrl;
  let curEle;

  while (minIdx <= maxIdx) {
    curIdx = ((minIdx + maxIdx) / 2) | 0;
    curUrl = bookmarks.get(curIdx).get('url');
    curEle = parseInt(bookmarks.get(curIdx).get('timestamp'), 10);

    if (curEle > item.ts) {
      minIdx = curIdx + 1;
    } else if (curEle < item.ts) {
      maxIdx = curIdx - 1;
    } else if (curEle === item.ts && (item.url !== curUrl && rts(item.url) !== rts(curUrl))) {
      /**
       * If multiple recordings are within a timestamp, or if the url
       * for the timestamp doesn't match exactly, iterate over other
       * options. If no exact match is found, resolve to first ts match.
       */
      let tempUrl;
      const origIdx = curIdx;
      while (curEle === item.ts && curIdx < bookmarks.size - 1) {
        tempUrl = bookmarks.get(++curIdx).get('url');
        curEle = parseInt(bookmarks.get(curIdx).get('ts'), 10);
        if (tempUrl === item.url) {
          return curIdx;
        }
      }
      return origIdx;
    } else {
      return curIdx;
    }
  }
  return -1;
};

export const getActiveBookmark = createSelector(
  [timestampOrderedBookmarkSearchResults, getTimestamp, getUrl],
  (bookmarkSearch, ts, url) => {
    const bookmarks = bookmarkSearch.bookmarkFeed;
    return bkmSearch(bookmarks, ts, url);
  }
);


export const getBookmarkTitle = createSelector(
  [timestampOrderedBookmarks, getTimestamp, getUrl],
  (bookmarks, ts, url) => {
    const idx = bkmSearch(bookmarks, ts, url);
    return idx === -1 ? 'Untitled Document' : bookmarks.getIn([idx, 'title']);
  }
);


export const getBookmarkCount = createSelector(
  [getBookmarks],
  (bookmarks) => {
    return bookmarks.size;
  }
);


export const getRemoteArchiveStats = createSelector(
  [getStats, getSize, getArchives],
  (stats, size, archives) => {
    const resources = [];

    if (stats.size > 0) {
      const sortedStats = stats.sort(sortFn);
      sortedStats.forEach((stat, id) => {
        // fixed resources
        if (['live', 'replay'].includes(id)) {
          switch (id) {
            case 'live':
              return resources.push({ name: 'Live web', id, stat });
            case 'replay':
              return resources.push({ name: 'Live web at time of recording', id, stat });
            default:
              break;
          }
        }

        const srcCollection = id.split(':', 2);
        let name = archives.getIn([srcCollection[0], 'name']);

        if (srcCollection.length > 1) {
          name += ` ${srcCollection[1]}`;
        }

        return resources.push({
          name,
          id,
          stat
        });
      });

      return resources;
    }

    return null;
  }
);

