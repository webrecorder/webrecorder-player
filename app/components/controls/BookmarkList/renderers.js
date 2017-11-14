import React from 'react';

import { buildDate } from 'helpers/utils';

import { Collection } from 'components/icons';


export function BookmarkRenderer({ cellData, rowData }) {
  return (
    <div className="bookmark-title" title={buildDate(rowData.get('timestamp'))}>
      <h2>{ cellData || 'Untitled document' }</h2>
      <span>{ rowData.get('url') }</span>
    </div>
  );
}

export function headerRenderer({dataKey, label, sortBy, sortDirection, columnData: { count, activeBookmark }}) {
  return (
    <div
      className="ReactVirtualized__Table__headerTruncatedText"
      key="label"
      title={label}>
      <Collection />
      <span dangerouslySetInnerHTML={{ __html: ` ${label} (${activeBookmark + 1} <em>of</em> ${count})` }} />
    </div>
  );
}
