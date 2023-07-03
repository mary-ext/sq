# sq

Lightweight asynchronous state management and data fetching solution for Solid.js

- Works similarly to Solid.js' createResource
- Fits right in between `createResource` and `@tanstack/solid-query`
- Allows directly handling previous query data within the query function (useful for infinite pagination)
- Does not mix up query data when switching between query keys

### Infinite query example

```tsx
import { type QueryFn, createQuery } from '@intrnl/sq';

// Utiltiies
interface Collection<Data, Param = unknown> {
	pages: Data[];
	params: Param[];
}

const pushCollection = <Data, Param>(
	collection: Collection<Data, Param>,
	page: Data,
	param: Param | undefined,
): Collection<Data, Param> => {
	if (collection && param !== undefined) {
		return {
			pages: collection.pages.concat(page),
			params: collection.params.concat(param),
		};
	}

	return {
		pages: [page],
		params: [param],
	};
};

const getCollectionCursor = <Data, Key extends keyof Data>(
	collection: Collection<Data, any> | undefined,
	key: Key,
): Data[Key] | undefined => {
	if (collection) {
		const pages = collection.pages;
		const last = pages[pages.length - 1];

		return last[key];
	}
};

// Query
interface User {
	id: number;
	name: string;
}

interface UsersListing {
	cursor: string | undefined;
	users: User[];
}

export const listUsersByQueryKey = (query: string) => {
	return ['listUsersByQuery', query];
};

export const listUsersByQuery: QueryFn<
	Collection<UsersListing>,
	ReturnType<typeof listUsersByQueryKey>,
	string
> = async (key, { data: collection, param }) => {
	const [, query] = key;

	const page = await request('...');

	return pushCollection(collection, page, param);
};

// Interface
const [users, { refetch }] = createQuery({
	key: () => listUsersByQueryKey(''),
	fetch: listUsersByQuery,
});

<Show when={getCollectionCursor(users(), 'cursor')}>
	{(cursor) => <button onClick={() => refetch(true, cursor())}>Show more</button>}
</Show>;
```
