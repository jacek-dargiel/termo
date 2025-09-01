import convert from 'lodash/fp/convert';

import _flow from 'lodash-es/flow';
import _fromPairs from 'lodash-es/fromPairs';
import _map from 'lodash-es/map';
import _isEmpty from 'lodash-es/isEmpty';
import _last from 'lodash-es/last';
import _mapValues from 'lodash-es/mapValues';
import _groupBy from 'lodash-es/groupBy';
import _sortBy from 'lodash-es/sortBy';

export let flow = convert('flow', _flow);
export let fromPairs = convert('fromPairs', _fromPairs);
export let map = convert('map', _map);
export let isEmpty = convert('isEmpty', _isEmpty);
export let last = convert('last', _last);
export let mapValues = convert('mapValues', _mapValues);
export let groupBy = convert('groupBy', _groupBy);
export let sortBy = convert('sortBy', _sortBy);

export let mapValuesWithKey = convert('mapValues', _mapValues, { cap: false });
