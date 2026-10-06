export type FeedPost = {
  id: string;
  author: string;
  handle: string;
  initials: string;
  time: string;
  body: string;
  likes: number;
  replies: number;
  liked?: boolean;
};

export const starterPosts: FeedPost[] = [
  {
    id: 'post-1',
    author: 'Ama Boateng',
    handle: 'amaboateng',
    initials: 'AB',
    time: '2h',
    body: 'Finance case write-up is up in the library. I used the one-page assumptions list from Wednesday’s workshop — it made the recommendation much cleaner.',
    likes: 18,
    replies: 4,
  },
  {
    id: 'post-2',
    author: 'MBA Office',
    handle: 'mbaoffice',
    initials: 'MO',
    time: '4h',
    body: 'Reminder: guest lecture Thursday 18:00, Berekuso / hybrid. Scaling operations in West Africa. Bring one question from your capstone org.',
    likes: 31,
    replies: 6,
  },
  {
    id: 'post-3',
    author: 'Kojo Mensah',
    handle: 'kojomensah',
    initials: 'KM',
    time: '6h',
    body: 'Looking for a case partner for Strategy this week. I can take industry analysis if you want the recommendation memo.',
    likes: 9,
    replies: 7,
  },
  {
    id: 'post-4',
    author: 'Efua Sarpong',
    handle: 'efuasarpong',
    initials: 'ES',
    time: '1d',
    body: 'Alumni office hours next week for people exploring ops and product roles. I put the signup note under Career.',
    likes: 22,
    replies: 3,
  },
  {
    id: 'post-5',
    author: 'Yaw Owusu',
    handle: 'yawowusu',
    initials: 'YO',
    time: '1d',
    body: 'If you are stuck on the financial model starter: lock revenue last. Get the cost structure honest first, then the story holds in class.',
    likes: 14,
    replies: 2,
  },
];

export const suggestedPeople = [
  { name: 'Ama Boateng', handle: 'amaboateng', initials: 'AB', note: 'Finance · Term 2' },
  { name: 'Kojo Mensah', handle: 'kojomensah', initials: 'KM', note: 'Strategy · Term 4' },
  { name: 'Efua Sarpong', handle: 'efuasarpong', initials: 'ES', note: 'Alumni mentor' },
] as const;
