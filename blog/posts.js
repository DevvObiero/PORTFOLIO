// Every blog post, in one list.
// blog/index.html builds its cards from this list, and each post page uses
// it for its "Previous post" / "Next post" links. Order doesn't matter:
// posts are sorted newest first by date.
//
// To add a post, copy an entry and change every field:
//   title        shown on the card (same as the post's <h1>)
//   slug         the post's file name in blog/posts/, without ".html"
//   date         YYYY-MM-DD
//   description  one or two sentences for the card
//   tags         also become the filter buttons on the blog home page
//   readingTime  minutes (roughly words / 225)
//   cover        e.g. "/blog/images/my-post.webp", or "" for no image
export const posts = [
  {
    title: "From Losing My Mom to Finding Purpose in Code: My Journey as a Self-Taught Developer",
    slug: "losing-my-mom-finding-purpose-in-code",
    date: "2026-10-23",
    description:
      "Learning to code alone, losing the person I was doing it for, and how frontend work gave me a reason to keep going.",
    tags: ["Career"],
    readingTime: 5,
    cover: "",
  },
  {
    title: "Vanilla JavaScript Is Still Enough: Building a Blog Without a Framework",
    slug: "vanilla-javascript-blog-without-a-framework",
    date: "2026-10-16",
    description:
      "How this blog works: one posts.js file, cards rendered with plain JavaScript, a tag filter, and static pages that share properly.",
    tags: ["JavaScript", "Frontend"],
    readingTime: 6,
    cover: "",
  },
  {
    title: "Building Fast, Conversion-Focused Landing Pages",
    slug: "fast-conversion-landing-pages",
    date: "2026-10-09",
    description:
      "Mobile-first layout, sticky CTAs, forms that don't fight people, Core Web Vitals and conversion tracking, with the code I actually use.",
    tags: ["Frontend", "Performance"],
    readingTime: 6,
    cover: "",
  },
  {
    title: "What I've Learned Building on GoHighLevel",
    slug: "building-on-gohighlevel",
    date: "2026-10-02",
    description:
      "What GoHighLevel is genuinely good at, a full lead-to-booking workflow, custom code and webhooks, and the mistakes I see most.",
    tags: ["GoHighLevel", "Automation"],
    readingTime: 6,
    cover: "",
  },
  {
    title: "Automating the Boring Stuff with Zapier and Make",
    slug: "zapier-and-make-automation",
    date: "2026-09-25",
    description:
      "When I pick Zapier, when I pick Make, how I handle errors and duplicates, what it costs as volume grows, and when I write code instead.",
    tags: ["Automation", "Zapier", "Make"],
    readingTime: 7,
    cover: "",
  },
];
