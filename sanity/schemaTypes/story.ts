import { defineField, defineType } from 'sanity'

export const storyType = defineType({
  name: 'story',
  title: 'Story',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'Story ID',
      type: 'string',
      description: 'This should match the story slug used in your current app routes.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Story Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline / Description',
      type: 'string',
      description: "e.g., \"She hadn't opened the window in eleven years.\"",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mood',
      title: 'Story Mood',
      type: 'string',
      options: {
        list: [
          { title: 'Melancholic 🌧️', value: 'melancholic' },
          { title: 'Mystery 🔮', value: 'mysterious' },
          { title: 'Thrilling ⚡', value: 'thrilling' },
          { title: 'Cozy ☕', value: 'warm' },
          { title: 'Romantic🌹', value: 'romantic' },
          { title: 'Humorous 😂', value: 'humorous' },
          { title: 'Hopeful 🌅', value: 'hopeful' },
          { title: 'Dark 🌑', value: 'dark' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'object',
      fields: [
        defineField({
          name: 'id',
          title: 'Author ID',
          type: 'string',
          description: 'For example: arjun-mehta, priya-sharma, rohan-das',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'name',
          title: 'Author Name',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'bio',
          title: 'Author Bio',
          type: 'text',
        }),
        defineField({
          name: 'avatar',
          title: 'Author Avatar',
          type: 'string',
          description: 'Initials or fallback text used in the UI.',
        }),
        defineField({
          name: 'avatarColor',
          title: 'Avatar Color',
          type: 'string',
          description: 'Hex color used for the author avatar background.',
        }),
        defineField({
          name: 'image',
          title: 'Author Profile Image',
          type: 'image',
          description: 'Upload a clean avatar picture for the creator profile page.',
          options: {
            hotspot: true,
          },
        }),
        defineField({
          name: 'followers',
          title: 'Followers Count',
          type: 'number',
          description: 'The base number of followers showing on the dashboard profile.',
          initialValue: 0,
        }),
        defineField({
          name: 'storiesCount',
          title: 'Stories Count',
          type: 'number',
          initialValue: 1,
        }),
        defineField({
          name: 'joinedDate',
          title: 'Joined Date',
          type: 'string',
          description: 'Use YYYY-MM-DD format to keep the same string type as your app.',
        }),
      ],
    }),
    defineField({
      name: 'totalReadMinutes',
      title: 'Reading Duration (Minutes)',
      type: 'number',
      initialValue: 4,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'string',
      description: 'Use a string date format like YYYY-MM-DD to match your current app data.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Story',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'tags',
      title: 'Story Tags',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'scenes',
      title: 'Story Scenes',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'scene',
          title: 'Scene',
          fields: [
            defineField({
              name: 'id',
              title: 'Scene ID',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'sceneNumber',
              title: 'Scene Number',
              type: 'number',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'ambientEmoji',
              title: 'Ambient Emoji',
              type: 'string',
            }),
            defineField({
              name: 'bgClass',
              title: 'Background Class',
              type: 'string',
            }),
            // 👇 SWAPPED: Removed visualPrompt and added the physical image upload field block
            defineField({
              name: 'sceneImage',
              title: 'Scene Background Image',
              type: 'image',
              description: 'Upload a custom background artwork illustration for this specific scene.',
              options: {
                hotspot: true, // Let's you crop/focal point inside Sanity Studio safely
              },
            }),
            defineField({
              name: 'text',
              title: 'Scene Text',
              type: 'text',
              rows: 8,
              description: 'Keep this concise so each scene fits in one reader page (max 120 words).',
              validation: (Rule) =>
                Rule.required().custom((value) => {
                  if (!value || typeof value !== 'string') return true
                  const wordCount = value.trim().split(/\s+/).filter(Boolean).length
                  return wordCount <= 120
                    ? true
                    : `Scene text is too long (${wordCount} words). Keep it to 120 words or less.`
                }),
            }),
          ],
        },
      ],
    }),
  ],
})