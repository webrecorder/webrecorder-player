import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import Column from 'react-virtualized/dist/commonjs/Table/Column';
import Table from 'react-virtualized/dist/commonjs/Table';

import { updateUrlAndTimestamp } from 'redux/modules/controls';

import { Collection } from 'components/icons';
import Searchbox from 'components/Searchbox';

import { BookmarkRenderer, headerRenderer } from './renderers';

import './style.scss';


class BookmarkList extends Component {

  shouldComponentUpdate(nextProps) {
    if (nextProps.bookmarks.equals(this.props.bookmarks) &&
        nextProps.searchText === this.props.searchText &&
        nextProps.activeBookmark === this.props.activeBookmark) {
      return false;
    }

    return true;
  }

  onSelectRow = ({ index, rowData }) => {
    this.props.dispatch(updateUrlAndTimestamp(rowData.get('url'), rowData.get('timestamp'), rowData.get('title')));
  }

  search = (evt) => {
    const { dispatch, searchBookmarks } = this.props;

    dispatch(searchBookmarks(evt.target.value));
  }

  render() {
    const { activeBookmark, bookmarks, collection, searchText } = this.props;

    return (
      <div className="bookmarks-list">
        <header>
          <Collection />
          <span dangerouslySetInnerHTML={{ __html: ` Collection Bookmarks (${activeBookmark + 1} <em>of</em> ${bookmarks.size})` }} />
        </header>
        <Searchbox
          search={this.search}
          searchText={searchText}
          placeholder="search for pages in index" />
        <div className="bookmarks">
          <AutoSizer>
            {
              ({ height, width }) => (
                <Table
                  width={width}
                  height={height}
                  rowCount={bookmarks.size}
                  rowHeight={50}
                  rowGetter={({ index }) => bookmarks.get(index)}
                  rowClassName={({ index }) => { return index === activeBookmark ? 'selected' : ''; }}
                  onRowClick={this.onSelectRow}
                  scrollToIndex={activeBookmark}>
                  <Column
                    label="collection bookmarks"
                    dataKey="title"
                    flexGrow={1}
                    width={200}
                    columnData={{ count: bookmarks.size, activeBookmark }}
                    headerRenderer={headerRenderer}
                    cellRenderer={BookmarkRenderer} />
                </Table>
              )
            }
          </AutoSizer>
        </div>
      </div>
    );
  }
}

export default BookmarkList;
