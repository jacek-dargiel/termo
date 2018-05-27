export interface AIOFeed {
    username: string;
    owner: AIOFeedOwner;
    id: number;
    name: string;
    description: string;
    history: boolean;
    unit_type: any;
    unit_symbol: any;
    last_value: string;
    visibility: string;
    license: any;
    created_at: string;
    updated_at: string;
    status_notify: boolean;
    status_timeout: number;
    enabled: boolean;
    key: string;
    group: AIOFeedGroup;
    groups: AIOFeedGroup[];
}

interface AIOFeedGroup {
    id: number;
    key: string;
    name: string;
    user_id: number;
}

interface AIOFeedOwner {
    id: number;
    username: string;
}

export interface Point {
    x: number;
    y: number;
}

export interface AIOFeedData {
    id: string;
    value: string;
    feed_id: number;
    feed_key: string;
    created_at: string;
    location: string | null;
    lat: string | null;
    lon: string | null;
    ele: string | null;
    created_epoch: number;
    expiration: string;
}
