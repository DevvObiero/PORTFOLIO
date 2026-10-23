# How to add a blog post

Adding a post takes two steps. You don't need to touch any other file.

## 1. Make the post page

1. Copy `blog/_template.html` into the `blog/posts/` folder.
2. Rename the copy after your post, using lowercase words joined by hyphens, for example
   `blog/posts/my-first-client-project.html`.
   The name without `.html` (`my-first-client-project`) is the post's **slug**. You'll need it again in step 2.
3. Open the file and search for **CHANGE**. Each one marks something to fill in:
   - the title (it appears in a few places at the top of the file: the `<title>`, `og:title`,
     `twitter:title` and `headline`)
   - the description (one or two sentences, about 150 characters)
   - the four web addresses that end in `your-post-slug.html`: change them to your slug
   - the date, written as `YYYY-MM-DD`, for example `2026-11-04`
   - the tags, the title, the short intro under it, the date and the reading time near the top of
     the page
4. **Delete the line** `<meta name="robots" content="noindex" />` near the top. It's only there so
   Google doesn't list the template itself.
5. Write your post inside `<div class="post-body">`. The template shows an example of every style:
   headings, lists, quotes, code and images. Replace the examples with your own writing.
   - Use `<h2>` for sections and `<h3>` for smaller headings inside them.
   - If the post has no code blocks, delete the Prism `<script>` line in the `<head>`.
   - If you have no cover image, delete the `<figure class="post-cover">` block.

## 2. Add the post to the list

Open `blog/posts.js`, copy one of the existing entries (everything from `{` to `},`), paste it
anywhere in the list, and change each field:

```js
{
  title: "My First Client Project",
  slug: "my-first-client-project",    // must match the file name from step 1
  date: "2026-11-04",                 // YYYY-MM-DD
  description: "One or two sentences for the card on the blog home page.",
  tags: ["Frontend"],                 // spell tags the same way every time
  readingTime: 5,                     // minutes: about one minute per 225 words
  cover: "",                          // or "/blog/images/my-first-client-project.webp"
},
```

The blog home page sorts posts by date, so the newest always comes first. The previous/next links
at the bottom of each post update themselves.

That's it. Push to GitHub and Netlify will publish it.

## Checking it before you publish

The blog uses JavaScript modules, which don't work if you double-click an HTML file. To preview
locally, run a small web server from the project folder, then open http://localhost:8000/blog/

```sh
python -m http.server 8000
```

(VS Code's Live Server extension works too.)

If a post's previous/next links don't appear, open the browser console: it will say if the slug in
`posts.js` doesn't match the post's file name.

## Images

- Put images in `blog/images/`. WebP files are smallest.
- Always fill in `alt="..."` with a short description of what the image shows.
- **Share preview image (optional):** LinkedIn and X look best with an image 1200×630 pixels.
  To use one, put it in `blog/images/`, then in the post's `<head>`:
  set `og:image` and `twitter:image` to its full address
  (`https://paulobiero.me/blog/images/your-image.webp`) and change `twitter:card` to
  `summary_large_image`. Without one, posts use `me.png`.

## Optional: the sitemap

Search engines find new posts faster if you also add them to `sitemap.xml`. Copy one of the
`/blog/posts/...` entries there and change the address and date. Nothing breaks if you skip this.
