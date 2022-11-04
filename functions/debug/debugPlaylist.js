import convertPlaylist from '../src/utils/convertPlayerJSPlaylist'
import util from 'util'
const playlist = '#2WzI0MHBdaHR0cHM6Ly9zdHJlYW0udm9pZGJvb3N0LmNjLzIvMi8zLzgvNy8xLzVjMzVlM2JkM2ZmYTRmYzViNzlmNTg0ZjYzZmI5NGMzOjIwMjIwODMwMDM6WnpaSFoybEZjR0YxWm5sUlJWQjVPRVJVWTJsV05ERkxhRWR5ZVVSTE16Vk5UbVJoV1U1b1JtSXdLM0UxYWpZckwwTnBRbTVxZVhwWE56VTVaVUpPVWxkaFlWaHVSV0pGUlhKQ01YTTNORWN3VWpOUVQzYzVWbUZzWVdKNlYyNVJTRWQ2YjB0Sk0wUkpXVms5L2JsdjdvLm1wNDpobHM6bWFuaWZlc3QubTN1OCBvciBodHRwczovL3N0cmVhbS52b2lkYm9vc3QuY2MvMDQ0ZjM3OWNjZTNlYWNjMDc2ZTI2YWIxZTYwY2YzOTE6MjAyMjA4MzAwMzpaelpIWjJsRmNHRjFabmxSUlZCNU9FUlVZMmxXTkRGTGFFZHllVVJMTXpWTlRtUmhXVTVvUm1Jd0szRTFhallyTDBOcFFtNXFlWHBYTnpVNVpVSk9VbGRoWVZodVJXSkZSWEpDTVhNM05FY3dVak5RVDNjNVZtRnNZV0o2VjI1UlNFZDZiMHRKTTBSSldWazkvMi8yLzMvOC83LzEvYmx2N28ubXA0LFszNjBwXWh0dHBzOi8vc3RyZWFtLnZvaWRib29zdC5jYy8yLzIvMy84LzcvMS81YzM1ZTNiZDNmZmE0ZmM1Yjc5ZjU4NGY2M2ZiOTRjMzoyMDIyMDgzMDAzOlp6WkhaMmxGY0dGMVpubFJSVkI1T0VSVVkybFdOREZMYUVkeWVVUkxNelZOVG1SaFdVNW9SbUl3SzNFMWFqWXJMME5wUW01cWVYcFhOelU1WlVKT1VsZGhZVmh1UldKRlJYSkNNWE0zTkVjd1VqTlFUM2M1Vm1Gc1lXSjZWMjVSU0VkNmIwdEpNMFJKV1ZrOS9ibHY3by5tcDQ6aGxzOm1hbmlmZXN0Lm0zdTggb3IgaHR0cHM6Ly9zdHJlYW0udm9pZGJvb3N0LmNjLzA0NGYzNzljY2//_//Xl4jQEAhIUAjISQ=UzZWFjYzA3NmUyNmFiMWU2MGNmMzkxOjIwMjIwODMwMDM6WnpaSFoybEZjR0YxWm5sUlJWQjVPRVJVWTJsV05ERkxhRWR5ZVVSTE16Vk5UbVJoV1U1b1JtSXdLM0UxYWpZckwwTnBRbTVxZVhwWE56VTVaVUpPVWxkaFlWaHVSV0pGUlhKQ01YTTNORWN3VWpOUVQzYzVWbUZzWVdKNlYyNVJTRWQ2YjB0Sk0wUkpXVms5LzIvMi8zLzgvNy8xL2Jsdjdv//_//Xl5eXl5eIyNALm1wNCxbNDgwcF1odHRwczovL3N0cmVhbS52b2lkYm9vc3QuY2MvMi8yLzMvOC83LzEvNWMzNWUzYmQzZmZhNGZjNWI3OWY1ODRmNjNmYjk0YzM6MjAyMjA4MzAwMzpaelpIWjJsRmNHRjFabmxSUlZCNU9FUlVZMmxXTkRGTGFFZHllVVJMTXpWTlRtUmhXVTVvUm1Jd0szRTFhallyTDBOcFFtNXFlWHBYTnpVNVpVSk9VbGRoWVZodVJXSkZSWEpDTVhNM05FY3dVak5RVDNjNVZtRnNZV0o2VjI1UlNFZDZiMHRKTTBSSldWazkvejhsbGYubXA0OmhsczptYW5pZmVzdC5tM3U4IG9yIGh0dHBzOi8vc3RyZWFtLnZvaWRib29zdC5jYy81MmI2NTQwMmZiN2YyNzNkMTkyOTExYTBiNTcxYzIzYjoyMDIyMDgzMDAzOlp6WkhaMmxGY0dGMVpubFJSVkI1T0VSVVkybFdOREZMYUVkeWVVUkxNelZOVG1SaFdVNW9SbUl3SzNFMWFqWXJMME5wUW01cWVYcFhOelU1WlVKT1VsZGhZVmh1UldKRlJYSkNNWE0zTkVjd1VqTlFUM2M1Vm1Gc1lXSjZWMjVSU0VkNmIwdEpNMFJKV1ZrOS8yLzIvMy84LzcvMS96OGxsZi5tcDQsWzcyMHBdaHR0cHM6Ly9zdHJlYW0udm9pZGJvb3N0LmNjLzIvMi8zLzgvNy8xLzVjMzVlM2JkM2ZmYTRmYzViNzlmNTg0ZjYzZmI5NGMzOjIwMjIwODMwMDM6WnpaSFoybEZjR0YxWm5sUlJWQjVPRVJVWTJsV05ERkxhRWR5ZVVSTE16Vk5UbVJoV1U1b1JtSXdLM0UxYWpZckwwTnBRbTVxZVhwWE56VTVaVUpPVWxkaFlWa//_//QCFeXiFAI0BAJCQkJCQ=HVSV0pGUlhKQ01YTTNORWN3VWpOUVQzYzVWbUZzWVdKNlYyNVJTRWQ2YjB0Sk0wUkpXVms5L3JrYW50Lm1wNDpobHM6bWFuaWZlc3//_//JCQkIyMjIyEhISEhISE=QubTN1OCBvciBodHRwczovL3N0cmVhbS52b2lkYm9vc3QuY2MvNjlmN2RiNmNkZGJiMDlmNzFhOWM4OWQzNDYwN2UxNDk6MjAyMjA4MzAwMzpaelpIWjJsRmNHRjFabmxSUlZCNU9FUlVZMmxXTkRGTGFFZHllVVJMTXpWTlRtUmhXVTVvUm1Jd0szRTFhallyTDBOcFFtNXFlWHBYTnpVNVpVSk9VbGRoWVZodVJXSkZSWEpDTVhNM05FY3dVak5RVDNjNVZtRnNZV0o2VjI1UlNFZDZiMHRKTTBSSldWazkvMi8yLzMvOC83LzEvcmthbnQubXA0LFsxMDgwcF1odHRwczovL3N0cmVhbS52b2lkYm9vc3QuY2MvMi8yLzMvOC83LzEvNWMzNWUzYmQzZmZhNGZjNWI3OWY1ODRmNjNmYjk0YzM6MjAyMjA4MzAwMzpaelpIWjJsRmNHRjFabmxSUlZCNU9FUlVZMmxXTkRGTGFFZHllVVJMTXpWTlRtUmhXVTVvUm1Jd0szRTFhallyTDBOcFFtNXFlWHBYTnpVNVpVSk9VbGRoWVZodVJXSkZSWEpDTVhNM05FY3dVak5RVDNjNVZtRnNZV0o2VjI1UlNFZDZiMHRKTTBSSldWazkvZGJwYXUubXA0OmhsczptYW5pZmVzdC5tM3U4IG9yIGh0dHBzOi8vc3RyZWFtLnZvaWRib29zdC5jYy8wYWUwNWM4NmM0MGQwZjQ2ZTdiY2ViMzljM2QwY2I2YjoyMDIyMDgzMDAzOlp6WkhaMmxGY0dGMVpubFJSVkI1T0VSVVkybFdOREZMYUVkeWVVUkxNelZOVG1SaFdVNW9SbUl3SzNFMWFqWXJMME5wUW01cWVYcFhOelU1WlVKT1VsZGhZVmh1UldKRlJYSkNNWE0zTkVjd1VqTlFUM2M1Vm1G//_//QCMhQEBAIyMkJEBAc1lXSjZWMjVSU0VkNmIwdEpNMFJKV1ZrOS8yLzIvMy84LzcvMS9kYnBhdS5tcDQ='

const details = convertPlaylist(playlist)
// eslint-disable-next-line no-console
console.log(util.inspect(details, false, null, true))