const fetch = require('node-fetch')
const queryString = require('query-string')
const crypto = require('crypto')

exports.sourceNodes = ({ boundActionCreators, createNodeId }, configOptions) => {
  const { createNode } = boundActionCreators

  delete configOptions.plugins

  const processPost = post => {
    const nodeId = createNodeId(`hubspot-post-${post.id}`)
    const nodeContent = JSON.stringify(post)
    const nodeContentDigest = crypto
      .createHash('md5')
      .update(nodeContent)
      .digest('hex')

    const nodeData = Object.assign({}, post, {
      id: nodeId,
      parent: null,
      children: [],
      internal: {
        type: `HubspotPost`,
        content: nodeContent,
        contentDigest: nodeContentDigest
      }
    })

    return nodeData
  }

  const API_KEY = configOptions.key
  const filters = configOptions.filters
    ? queryString.stringify(configOptions.filters)
    : null
  const API_ENDPOINT_POST = `https://api.hubapi.com/content/api/v2/blog-posts?hapikey=${API_KEY}${
      filters ? '&' + filters : ''
    }`
  const API_ENDPOINT_TOPIC = `https://api.hubapi.com/blogs/v3/topics?hapikey=${API_KEY}`

  if (!API_KEY) throw new Error('No Hubspot API key provided')

  console.log(
    '\n  gatsby-source-hubspot\n  ------------------------- \n  Fetching post topics from: \x1b[33m',
    `\n  ${API_ENDPOINT_TOPIC}\x1b[0m\n`,
    ' Fetching posts from: \x1b[33m',
    `\n  ${API_ENDPOINT_POST}\x1b[0m\n`
  )

  let topics = []

  return fetch(API_ENDPOINT_TOPIC)
    .then(response => response.json())
    .then(data => {
      topics = data.objects.map(topic => {
        return {
          id: topic.id,
          name: topic.name,
          slug: topic.slug,
          description: topic.description
        }
      })
    })
    .then(() => {
      return fetch(API_ENDPOINT_POST)
          .then(response => response.json())
          .then(data => {
            const cleanData = data.objects.map(post => {
              const p = {
                id: post.id,
                title: post.title,
                body: post.post_body,
                state: post.state,
                topics: [],
                author: post.blog_post_author
                  ? {
                      id: post.blog_post_author.id,
                      avatar: post.blog_post_author.avatar,
                      name: post.blog_post_author.display_name,
                      full_name: post.blog_post_author.full_name,
                      bio: post.blog_post_author.bio,
                      email: post.blog_post_author.email,
                      facebook: post.blog_post_author.facebook,
                      google_plus: post.blog_post_author.google_plus,
                      linkedin: post.blog_post_author.linkedin,
                      twitter: post.blog_post_author.twitter,
                      twitter_username: post.blog_post_author.twitter_username,
                      website: post.blog_post_author.website,
                      slug: post.blog_post_author.slug
                    }
                  : null,
                feature_image: {
                  url: post.featured_image,
                  alt_text: post.featured_image_alt_text
                },
                meta: {
                  title: post.page_title,
                  description: post.meta_description
                },
                campaign: post.campaign
                  ? {
                      id: post.campaign,
                      name: post.campaign.campaign_name
                    }
                  : null,
                summary: post.post_summary,
                published: post.publish_date,
                updated: post.updated,
                created: post.created,
                slug: post.slug,
                url: post.url
              }

              if (post.topic_ids.length) {
                topics.forEach((topic) => {
                  if (post.topic_ids.includes(topic.id)) {
                    p.topics.push(topic)
                  }
                })
              }

              return p
            })
            cleanData.forEach(post => {
              const nodeData = processPost(post)
              createNode(nodeData)
            })
          })
    })
}
