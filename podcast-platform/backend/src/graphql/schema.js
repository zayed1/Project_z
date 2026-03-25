// ============================================
// GraphQL Schema | طبقة GraphQL
// ============================================
const { buildSchema } = require('graphql');
const { supabase } = require('../config/supabase');

const schema = buildSchema(`
  type Podcast {
    id: ID!
    title: String!
    description: String
    cover_image_url: String
    category_id: String
    user_id: String
    created_at: String
    episodes: [Episode]
  }

  type Episode {
    id: ID!
    title: String!
    description: String
    audio_file_url: String
    duration: Float
    play_count: Int
    podcast_id: String
    created_at: String
    podcast: Podcast
  }

  type User {
    id: ID!
    username: String!
    email: String
    role: String
    avatar_url: String
    created_at: String
  }

  type Comment {
    id: ID!
    content: String!
    episode_id: String
    user_id: String
    user: User
    created_at: String
  }

  type PaginatedEpisodes {
    episodes: [Episode]
    total: Int
    page: Int
    pageSize: Int
  }

  type Query {
    podcasts(limit: Int, offset: Int): [Podcast]
    podcast(id: ID!): Podcast
    episodes(podcastId: ID!, limit: Int, offset: Int): PaginatedEpisodes
    episode(id: ID!): Episode
    searchPodcasts(query: String!): [Podcast]
    popularEpisodes(limit: Int): [Episode]
    comments(episodeId: ID!): [Comment]
  }
`);

const root = {
  podcasts: async ({ limit = 20, offset = 0 }) => {
    const { data } = await supabase.from('podcasts').select('*').range(offset, offset + limit - 1).order('created_at', { ascending: false });
    return data || [];
  },

  podcast: async ({ id }) => {
    const { data } = await supabase.from('podcasts').select('*').eq('id', id).single();
    if (data) {
      const { data: eps } = await supabase.from('episodes').select('*').eq('podcast_id', id).order('created_at', { ascending: false });
      data.episodes = eps || [];
    }
    return data;
  },

  episodes: async ({ podcastId, limit = 20, offset = 0 }) => {
    const { data, count } = await supabase
      .from('episodes')
      .select('*', { count: 'exact' })
      .eq('podcast_id', podcastId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    return { episodes: data || [], total: count || 0, page: Math.floor(offset / limit), pageSize: limit };
  },

  episode: async ({ id }) => {
    const { data } = await supabase.from('episodes').select('*, podcasts:podcast_id(*)').eq('id', id).single();
    if (data) { data.podcast = data.podcasts; delete data.podcasts; }
    return data;
  },

  searchPodcasts: async ({ query }) => {
    const { data } = await supabase.from('podcasts').select('*').ilike('title', `%${query}%`).limit(20);
    return data || [];
  },

  popularEpisodes: async ({ limit = 10 }) => {
    const { data } = await supabase.from('episodes').select('*, podcasts:podcast_id(title, cover_image_url)')
      .order('play_count', { ascending: false }).limit(limit);
    return (data || []).map((e) => ({ ...e, podcast: e.podcasts }));
  },

  comments: async ({ episodeId }) => {
    const { data } = await supabase.from('comments')
      .select('*, users:user_id(id, username, avatar_url)')
      .eq('episode_id', episodeId)
      .order('created_at', { ascending: false });
    return (data || []).map((c) => ({ ...c, user: c.users }));
  },
};

module.exports = { schema, root };
