# gatsby-source-hubspot

[![npm version](https://badge.fury.io/js/gatsby-source-hubspot.svg)](https://badge.fury.io/js/gatsby-source-hubspot) ![](https://img.shields.io/badge/gatsby-v2-yellow)

---

#### ⚠️ Deprication notice: 

This package currently only supports up to Gatsby v2 and should therefore be considered **depricated** for newer version. 
For the time being, the repo will remain active in case there are any critical fixes needed for consumers using older versions of Gatsby.

---

This source plugin for Gatsby will make posts from a Hubspot blog available in GraphQL queries.

## Installation

```sh
# Install the plugin
yarn add gatsby-source-hubspot
```

_For Gatsby version 1 support use version 1.0.0 of this package_
```sh
yarn add gatsby-source-hubspot@1.0.0
```

## Configuration

In `gatsby-config.js`:

```js
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-hubspot',
      options: {
        key: 'YOUR_HUBSPOT_API_KEY'
      }
    }
  ]
};
```

**NOTE:** More information on [Hubspot authentication](https://developers.hubspot.com/docs/methods/auth/oauth-overview). 

## Filter Options

The `filter` options for this plugin mirror the [“Optional query string filters & options”](https://developers.hubspot.com/docs/methods/blogv2/get_blog_posts). Please review those docs for more details.

| Parameter name	    | Description
|---------------------|-----------------------------------------------------------------------------------
| `limit`             | The number of items to return. Defaults to 20
| `offset`            | The offset set to start returning rows from. Defaults to 0.
| `archived`          | Returns the posts that match the boolean lookup (e.g. archived=false returns all posts currently not archived).
| `blog_author_id`    | Returns the posts that match a particular blog author ID value.
| `campaign`          | Returns the posts that match the campaign guid. The campaign guid can be found in the campaign dashboard URL (e.g. https://app.hubspot.com/campaigns/:portal_id/#/details/:campaign_guid).
| `content_group_id`  | Returns the posts that match the blog guid. The blog guid can be found in the blog dashboard URL (e.g. https://app.hubspot.com/blog/:portal_id/dashboard/:blog_guid).
| `created`           | Returns the posts that match a particular created time value. Supports exact, range, gt, gte, lt, lte lookups.
| `deleted_at`        | Returns the posts that match a particular deleted time value. Supports exact, gt, gte, lt, lte lookups.
| `name`              | Returns the posts that match the name value. Supports exact, contains, icontains, ne lookups.
| `slug`              | Returns the posts that match a particular slug value.
| `updated`           | Returns the posts that match a particular updated time. Supports exact, range, gt, gte, lt, lte lookups.
| `state`             | DRAFT, PUBLISHED, or SCHEDULED.
| `order_by`          | Return the posts ordered by a particular field value. Blog posts can currently only be sorted by publish_date. Use a negative value to sort in descending order (e.g. order_by=-publish_date).                                                                                                                                                                                            |

### Example Filter Option Configuration

```js
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-hubspot',
      options: {
        key: process.env.HUBSPOT_API_KEY,
        filters: {
          limit: 10,
          state: 'PUBLISHED',
          offset: 2
        }
      }
    }
  ]
};
```

## Querying Hubspot Posts

Once the plugin is configured, two new queries are available in GraphQL: `allHubspotPost` and `HubspotPost`.

Here’s an example query to load 10 posts:

```gql
query PostQuery {
  allHubspotPost(limit: 10) {
    edges {
      node {
        id,
        title,
        body,
        state,
        author {
          id
          avatar,
          name,
          full_name,
          bio,
          email,
          facebook,
          google_plus,
          linkedin,
          twitter,
          twitter_username,
          website,
          slug
        },
        feature_image {
          url,
          alt_text
        },
        meta {
          title,
          description
        },
        summary,
        published,
        updated,
        created,
        slug
      } 
    }
  }
}
```

See the [Hubspot COS Blog Post API docs](https://developers.hubspot.com/docs/methods/blogv2/get_blog_posts) or the GraphiQL UI for info on all returned fields.
